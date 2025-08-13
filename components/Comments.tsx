// 'use client'
//
// import { Comments as CommentsComponent } from 'pliny/comments'
// import { useState } from 'react'
// import siteMetadata from '@/data/siteMetadata'
//
// export default function Comments({ slug }: { slug: string }) {
//   const [loadComments, setLoadComments] = useState(false)
//
//   if (!siteMetadata.comments?.provider) {
//     return null
//   }
//   return (
//     <>
//       {loadComments ? (
//         <CommentsComponent commentsConfig={siteMetadata.comments} slug={slug} />
//       ) : (
//         <button onClick={() => setLoadComments(true)}>Load Comments</button>
//       )}
//     </>
//   )
// }

'use client'

import { Comments as CommentsComponent } from 'pliny/comments'
import { useState } from 'react'
import siteMetadata from '@/data/siteMetadata'
import FirebaseComments from './FirebaseComments' // 导入新的组件

export default function Comments({ slug }: { slug: string }) {
  const [loadComments, setLoadComments] = useState(false)

  // 检查是否启用了 pliny 的评论提供商
  const isPlinyProvider = siteMetadata.comments?.provider

  // 决定使用哪种评论组件
  const CommentSection = () => {
    if (isPlinyProvider) {
      return <CommentsComponent commentsConfig={siteMetadata.comments} slug={slug} />
    } else {
      // 如果没有配置 pliny，则使用 Firebase 评论
      return <FirebaseComments slug={slug} />
    }
  }

  // 默认使用 pliny 的加载按钮
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