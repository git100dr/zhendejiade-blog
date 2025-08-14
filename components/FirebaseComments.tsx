'use client'

import { useState, useEffect } from 'react'
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

interface Comment {
  id: string
  username: string
  comment: string
  timestamp: Date
}

export default function FirebaseComments({ slug }: { slug: string }) {
  // **接收 slug 属性**
  const [commentText, setCommentText] = useState('')
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)

  // 匿名登录并获取评论
  useEffect(() => {
    // 匿名登录
    signInAnonymously(auth).catch((error) => {
      console.error('Anonymous login failed:', error)
    })

    // 监听评论数据
    const q = query(
      collection(db, 'comments'),
      where('slug', '==', slug), // **新增筛选条件**
      orderBy('timestamp', 'desc')
    )
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const fetchedComments: Comment[] = []
      querySnapshot.forEach((doc) => {
        const data = doc.data()
        fetchedComments.push({
          id: doc.id,
          username: data.username || '匿名用户',
          comment: data.comment,
          timestamp: data.timestamp?.toDate() || new Date(),
        })
      })
      setComments(fetchedComments)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [slug]) // **添加 slug 到依赖数组，确保 slug 变化时重新获取评论**

  const handleCommentSubmit = async () => {
    if (!commentText.trim()) {
      alert('评论内容不能为空！')
      return
    }

    try {
      // 检查用户是否已匿名登录
      if (!auth.currentUser) {
        await signInAnonymously(auth)
      }

      // 添加评论到 Firestore
      await addDoc(collection(db, 'comments'), {
        slug: slug, // **新增此行**
        username: '匿名用户', // 或 'Guest'
        comment: commentText,
        timestamp: serverTimestamp(),
      })

      setCommentText('')
      alert('评论已成功提交！')
    } catch (error) {
      console.error('提交评论失败:', error)
      alert('提交评论失败，请稍后再试。')
    }
  }

  return (
    <div className="comment-section mt-10">
      <h3 className="mb-4 text-2xl font-bold">评论区</h3>
      <div className="mb-4">
        <textarea
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          placeholder="在这里输入评论..."
          className="focus:ring-primary-500 h-24 w-full rounded-md border p-2 focus:ring-2 focus:outline-none dark:border-gray-600 dark:bg-gray-800"
        />
        <button
          onClick={handleCommentSubmit}
          className="bg-primary-500 hover:bg-primary-600 mt-2 rounded-md px-4 py-2 text-white"
        >
          提交
        </button>
      </div>

      <div className="comments-list">
        {loading ? (
          <div>加载评论中...</div>
        ) : (
          comments.map((comment) => (
            //             <div key={comment.id} className="p-4 border-b dark:border-gray-700">
            //               <p className="font-bold">匿名用户</p>
            //               <p>{comment.comment}</p>
            //               <p className="text-sm text-gray-500 dark:text-gray-400">
            //                 {comment.timestamp.toLocaleString()}
            //               </p>
            //             </div>
            <div key={comment.id} className="border-b p-4 dark:border-gray-700">
              {/* 用户名单独在第一行，靠左 */}
              <p className="mb-1 text-left font-bold text-gray-800 dark:text-white">
                {comment.username || '匿名用户'}
              </p>

              {/* 评论内容在下一行，靠左对齐（默认行为）*/}
              <p className="mb-1 text-left">{comment.comment}</p>

              {/* 时间在再下一行，靠右对齐 */}
              <p className="text-right text-sm text-gray-500 dark:text-gray-400">
                {comment.timestamp.toLocaleString()}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
