'use client'

type Feedback = {
  id: string
  user_email: string | null
  category: string
  title: string
  body: string
  status: string
  admin_reply: string | null
  created_at: string
}

const CATEGORY_LABEL: Record<string, string> = {
  bug: '버그',
  feature: '기능 제안',
  other: '기타',
}

const STATUS_LABEL: Record<string, string> = {
  new: '신규',
  in_progress: '처리중',
  resolved: '완료',
}

export default function ExportButton({ items }: { items: Feedback[] }) {
  function handleExport() {
    const headers = ['날짜', '카테고리', '상태', '제목', '내용', '답장', '이메일']
    const rows = items.map(item => [
      new Date(item.created_at).toLocaleDateString('ko-KR'),
      CATEGORY_LABEL[item.category] ?? item.category,
      STATUS_LABEL[item.status] ?? item.status,
      item.title,
      item.body,
      item.admin_reply ?? '',
      item.user_email ?? '',
    ])

    const csv = [headers, ...rows]
      .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n')

    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `feedback_${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <button
      onClick={handleExport}
      className="text-xs font-medium px-3 py-1.5 rounded-lg transition-all"
      style={{
        background: 'rgba(184,137,42,0.08)',
        color: '#d4a84b',
        border: '1px solid rgba(184,137,42,0.15)',
      }}
    >
      CSV 내보내기
    </button>
  )
}
