// 在文件顶部添加此指令，将其标记为客户端组件，以便使用 React Hooks
'use client'
import React, { useState, useEffect, useRef } from 'react'
import { getAuth, signInAnonymously } from 'firebase/auth'
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  onSnapshot,
  where,
} from 'firebase/firestore'
import { app, auth, db } from '../firebase' // 假设你的 firebase.js 文件在根目录

// Comment 的类型定义
interface Comment {
  id: string
  username: string
  comment: string
  timestamp: Date
}

const FirebaseCommentSection = ({ slug }) => {
  const [userName, setUserName] = useState('匿名用户')
  const [commentText, setCommentText] = useState('')
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)

  // 使用 useEffect 钩子监听 Firebase 评论的变化
  useEffect(() => {
    // 确保 slug 存在，以避免不必要的查询
    if (!slug) return

    // 获取 comments 集合的引用
    const commentsRef = collection(db, 'comments')

    // 创建一个查询，按 slug 过滤评论并按时间戳排序
    // 请注意：Firestore 默认不支持在不同字段上进行范围和相等查询，您可能需要在 Firebase 控制台创建索引
    const q = query(commentsRef, where('slug', '==', slug), orderBy('timestamp'))

    // 使用 onSnapshot 监听实时数据
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        setComments(
          snapshot.docs.map((doc) => {
            const data = doc.data()
            return {
              id: doc.id,
              user: data.user, // 如果你之前将字段名从 username 改为 user，这里也需要匹配
              text: data.text, // 如果你之前将字段名从 comment 改为 text，这里也需要匹配
              timestamp: data.timestamp,
            }
          }) as Comment[] // 使用类型断言来解决 TypeScript 推断问题
        )
      },
      (error) => {
        console.error('监听评论时出错: ', error)
      }
    )

    // 返回清理函数，在组件卸载时取消订阅
    return () => unsubscribe()
  }, [slug]) // 依赖项为 slug，当其改变时重新运行 effect

  /**
   * 处理新评论的提交
   * @param {React.FormEvent} e - 表单事件对象
   */

  const handleAddComment = async (e) => {
    e.preventDefault()
    if (!commentText.trim()) return

    // 🚨 检查 slug 是否存在
    if (!slug) {
      console.error('Slug is missing, comment cannot be added.')
      alert('评论失败：文章信息不完整。')
      return
    }

    // 创建新评论对象，包含 slug
    const newComment = {
      slug: slug, // **新增此行**
      user: userName || '匿名用户', // 如果没有提供用户名，则默认为 '匿名用户'
      text: commentText,
      timestamp: serverTimestamp(),
    }

    try {
      // 使用 addDoc 将新评论添加到 Firestore
      await addDoc(collection(db, 'comments'), newComment)

      // 添加成功后，清空输入框
      alert('评论已成功提交！')
      setCommentText('')
      setUserName('')
    } catch (error) {
      console.error('添加评论时出错: ', error)
      // 您可以在此处添加一个用户可见的错误提示
    }
  }

  return (
    <div className="rounded-md border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <h4 className="mb-4 text-xl font-medium text-gray-900 dark:text-gray-100">匿名评论</h4>
      <form onSubmit={handleAddComment} className="space-y-4">
        <div>
          <label htmlFor="name" className="sr-only">
            用户名
          </label>
          <input
            id="name"
            type="text"
            placeholder="昵称（可选）"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-4 py-2 focus:ring-1 focus:ring-gray-400 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
          />
        </div>
        <div>
          <label htmlFor="comment" className="sr-only">
            评论内容
          </label>
          <textarea
            id="comment"
            placeholder="评论内容..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            rows={4}
            required
            className="focus:ring-primary-500 w-full rounded-md border px-4 py-2 focus:ring-2 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
          />
        </div>
        <button
          type="submit"
          className="bg-primary-500 hover:bg-primary-600 focus:ring-primary-500 rounded-md px-8 py-1 text-base font-medium text-white focus:ring-2 focus:ring-offset-2 focus:outline-none"
        >
          提交
        </button>
      </form>
      <div className="mt-8 space-y-4">
        {comments.map((comment) => (
          <div key={comment.id} className="border-b border-gray-200 p-4 dark:border-gray-700">
            {/* 用户名：单独一行，靠左对齐 */}
            <div className="text-left font-medium text-gray-900 dark:text-gray-100">
              {comment.user}
            </div>

            {/* 评论内容：单独一行，靠左对齐 */}
            <p className="mt-2 text-left text-gray-700 dark:text-gray-300">{comment.text}</p>

            {/* 时间：单独一行，靠右对齐 */}
            <div className="mt-2 text-right text-sm text-gray-500 dark:text-gray-400">
              {comment.timestamp &&
              typeof comment.timestamp === 'object' &&
              comment.timestamp.seconds
                ? new Date(comment.timestamp.seconds * 1000).toLocaleString()
                : '时间戳不可用'}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * Giscus 组件，动态加载脚本以启用 GitHub 评论
 */
const GiscusComponent = () => {
  const giscusRef = useRef(null)

  useEffect(() => {
    const script = document.createElement('script')

    script.src = 'https://giscus.app/client.js'
    script.async = true
    script.crossOrigin = 'anonymous'

    // Replace these attributes with your actual Giscus configuration
    // 请将以下属性替换为您自己的 Giscus 配置
    script.setAttribute('data-repo', process.env.NEXT_PUBLIC_GISCUS_REPO)
    script.setAttribute('data-repo-id', process.env.NEXT_PUBLIC_GISCUS_REPOSITORY_ID)
    script.setAttribute('data-category', process.env.NEXT_PUBLIC_GISCUS_CATEGORY)
    script.setAttribute('data-category-id', process.env.NEXT_PUBLIC_GISCUS_CATEGORY_ID)
    script.setAttribute('data-mapping', 'pathname')
    script.setAttribute('data-reactions-enabled', '1')
    script.setAttribute('data-emit-metadata', '0')
    script.setAttribute('data-input-position', 'top')
    script.setAttribute('data-theme', 'preferred_color_scheme')
    script.setAttribute('data-lang', 'en')
    script.setAttribute('data-loading', 'lazy')

    const giscusContainer = giscusRef.current
    // 只有在 ref 存在时才追加脚本
    if (giscusContainer) {
      giscusContainer.appendChild(script)
    }

    // 清理函数，在组件卸载时移除脚本
    // **使用上面保存的本地变量**
    return () => {
      if (giscusContainer) {
        giscusContainer.innerHTML = ''
      }
    }
  }, [])

  return <div ref={giscusRef} className="giscus-container w-full"></div>
}

/**
 * Giscus 组件，动态加载脚本以启用 GitHub 评论
 */

const CommentSection = ({ slug }: { slug: string }) => {
  // 我们不再需要 commentType 状态和按钮，所以可以删除它们
  // const [commentType, setCommentType] = useState('firebase');

  return (
    <div className="py-8">
      {/* 移除按钮部分，因为它不再需要 */}

      {/* 使用 Flexbox 布局实现左右并排 */}
      <div className="flex flex-col gap-8 lg:flex-row lg:gap-12">
        {/* Firebase 匿名评论区 */}
        <div className="flex-1">
          <FirebaseCommentSection slug={slug} />
        </div>

        {/* Giscus 评论区 */}
        <div className="flex-1">
          <GiscusComponent />
        </div>
      </div>
    </div>
  )
}

export default CommentSection
