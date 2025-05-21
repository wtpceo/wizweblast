'use client';

import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Client } from '@/lib/mock-data';

interface ClientRegisterDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (newClient: Omit<Client, 'id'>) => void;
}

export function ClientRegisterDialog({ isOpen, onClose, onSave }: ClientRegisterDialogProps) {
  // 필수 정보
  const [name, setName] = useState('');
  
  // 선택 정보
  const [phoneNumber, setPhoneNumber] = useState('');
  const [naverPlaceUrl, setNaverPlaceUrl] = useState('');
  
  // 입력 필드 refs
  const nameInputRef = useRef<HTMLInputElement>(null);
  const phoneInputRef = useRef<HTMLInputElement>(null);
  const urlInputRef = useRef<HTMLInputElement>(null);
  
  // 대화상자가 열릴 때 이름 필드에 자동 포커스
  useEffect(() => {
    if (isOpen && nameInputRef.current) {
      setTimeout(() => {
        nameInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);
  
  // 키보드 단축키 처리
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      
      // Alt+S: 저장
      if (e.altKey && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
      // Esc: 이미 dialog에서 처리됨
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, name]);
  
  const handleSave = () => {
    if (!name) {
      alert('업체명을 입력해주세요.');
      nameInputRef.current?.focus();
      return;
    }
    
    // 기본 정보만 입력받고 나머지는 기본값으로 설정
    const newClient: Omit<Client, 'id'> = {
      name,
      phoneNumber,
      naverPlaceUrl,
      // 기본값 설정
      icon: '🏢', 
      contractStart: new Date().toISOString(),
      contractEnd: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString(),
      statusTags: ['신규'],
      usesCoupon: false,
      publishesNews: false,
      usesReservation: false
    };
    
    onSave(newClient);
    resetForm();
  };
  
  const resetForm = () => {
    setName('');
    setPhoneNumber('');
    setNaverPlaceUrl('');
  };
  
  const handleClose = () => {
    resetForm();
    onClose();
  };
  
  // 입력 필드 간 엔터 키로 이동
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, nextField: any) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      
      if (nextField && nextField.current) {
        nextField.current.focus();
      } else {
        // 마지막 필드에서 엔터를 누르면 저장 실행
        handleSave();
      }
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center">
            <span className="text-2xl mr-2">✨</span> 신규 광고주 등록
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-5 py-4">
          <div className="grid grid-cols-1 gap-2">
            <Label htmlFor="name" className="font-medium">업체명 <span className="text-red-500">*</span></Label>
            <Input
              id="name"
              ref={nameInputRef}
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, phoneInputRef)}
              placeholder="예: 서울 피자"
              className="col-span-3"
              aria-required="true"
            />
            <p className="text-xs text-gray-500">
              필수 입력 사항입니다. 나머지 정보는 나중에 추가할 수 있습니다.
            </p>
          </div>
          
          <div className="grid grid-cols-1 gap-2">
            <Label htmlFor="phoneNumber" className="font-medium">전화번호 (선택)</Label>
            <Input
              id="phoneNumber"
              ref={phoneInputRef}
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, urlInputRef)}
              placeholder="예: 02-1234-5678"
              className="col-span-3"
            />
          </div>
          
          <div className="grid grid-cols-1 gap-2">
            <Label htmlFor="naverPlaceUrl" className="font-medium">네이버플레이스 링크 (선택)</Label>
            <Input
              id="naverPlaceUrl"
              ref={urlInputRef}
              value={naverPlaceUrl}
              onChange={(e) => setNaverPlaceUrl(e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, null)}
              placeholder="예: https://place.naver.com/... 또는 naver.me/..."
              className="col-span-3"
            />
            <p className="text-xs text-gray-500">
              네이버 플레이스 전체 URL 또는 단축 URL(naver.me)을 입력하세요. 
              "http://" 또는 "https://"는 생략 가능합니다.
            </p>
          </div>
        </div>
        
        <DialogFooter className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={handleClose} 
            className="w-full"
            title="취소 (Esc)"
          >
            취소
          </Button>
          <Button 
            onClick={handleSave} 
            className="wiz-btn w-full"
            title="광고주 등록 완료 (Alt+S)"
          >
            광고주 등록 완료
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 