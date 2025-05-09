'use client';

import { Notice } from '@/lib/mock-data';
import { NoticeItem } from './NoticeItem';

interface NoticeListFullProps {
  notices: Notice[];
}

export function NoticeListFull({ notices }: NoticeListFullProps) {
  // 고정 공지와 일반 공지 분리
  const fixedNotices = notices.filter(notice => notice.isFixed);
  const regularNotices = notices.filter(notice => !notice.isFixed);

  return (
    <div>
      {/* 고정 공지사항 섹션 */}
      {fixedNotices.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center text-gray-700">
            <span className="mr-2">📌</span> 고정 공지
          </h2>
          <div className="bg-[#F9FAFD] rounded-lg p-4">
            {fixedNotices.map(notice => (
              <NoticeItem key={notice.id} notice={notice} />
            ))}
          </div>
        </div>
      )}

      {/* 일반 공지사항 섹션 */}
      <div>
        <h2 className="text-lg font-semibold mb-4 flex items-center text-gray-700">
          <span className="mr-2">📄</span> 일반 공지
        </h2>
        {regularNotices.length > 0 ? (
          regularNotices.map(notice => (
            <NoticeItem key={notice.id} notice={notice} />
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            등록된 일반 공지사항이 없습니다.
          </div>
        )}
      </div>

      {/* 공지사항이 아예 없는 경우 */}
      {notices.length === 0 && (
        <div className="text-center py-10">
          <div className="text-3xl mb-3">📄</div>
          <p className="text-gray-500">등록된 공지사항이 없습니다.</p>
        </div>
      )}
    </div>
  );
} 