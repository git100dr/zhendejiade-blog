import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

// 你的 Firebase 配置信息
const firebaseConfig = {
  apiKey: 'AIzaSyBAEnpkRDnoMAN9eJJrFSPEuQNsKwJ9KkM',
  authDomain: 'zhendejiade-1c262.firebaseapp.com',
  projectId: 'zhendejiade-1c262',
  storageBucket: 'zhendejiade-1c262.firebasestorage.app',
  messagingSenderId: '96225701845',
  appId: '1:96225701845:web:db320de230f753105ad75c',
  measurementId: 'G-VC0842DCNR',
}

// 初始化 Firebase
const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const db = getFirestore(app)

// 导出实例，以便在其他文件中使用
export { app, auth, db }
