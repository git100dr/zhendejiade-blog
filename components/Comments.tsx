'use client'

import { Comments as CommentsComponent } from 'pliny/comments'
import { useState } from 'react'
import siteMetadata from '@/data/siteMetadata'
import FirebaseComments from './FirebaseComments'

export default function Comments({ slug }: { slug: string }) {
  const [loadComments, setLoadComments] = useState(false)

  // 确保 siteMetadata.comments 存在
  const isPlinyProvider = siteMetadata.comments?.provider

  const CommentSection = () => {
    if (isPlinyProvider && siteMetadata.comments) {
      // **新增检查**
      return <CommentsComponent commentsConfig={siteMetadata.comments} slug={slug} />
    } else if (!isPlinyProvider) {
      // 如果没有配置 pliny，则使用 Firebase 评论
      return <FirebaseComments slug={slug} />
    }
    return null // 如果以上条件都不满足，不渲染任何东西
  }

  if (!isPlinyProvider) {
    return <CommentSection />
  }

  return (
    <>
      {loadComments ? (
        <CommentSection />
      ) : (
        <button onClick={() => setLoadComments(true)}>Load Comments</button>
      )}
    </>
  )
}
