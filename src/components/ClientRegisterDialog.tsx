'use client';

import { useState } from 'react';
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
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [naverPlaceUrl, setNaverPlaceUrl] = useState('');
  
  const handleSave = () => {
    if (!name) {
      alert('업체명을 입력해주세요.');
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
      statusTags: [],
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
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="예: 서울 피자"
              className="col-span-3"
            />
          </div>
          
          <div className="grid grid-cols-1 gap-2">
            <Label htmlFor="phoneNumber" className="font-medium">전화번호</Label>
            <Input
              id="phoneNumber"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="예: 02-1234-5678"
              className="col-span-3"
            />
          </div>
          
          <div className="grid grid-cols-1 gap-2">
            <Label htmlFor="naverPlaceUrl" className="font-medium">네이버플레이스 링크</Label>
            <Input
              id="naverPlaceUrl"
              value={naverPlaceUrl}
              onChange={(e) => setNaverPlaceUrl(e.target.value)}
              placeholder="예: https://place.naver.com/restaurant/1234567890"
              className="col-span-3"
            />
          </div>
        </div>
        
        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={handleClose} className="w-full">
            취소
          </Button>
          <Button onClick={handleSave} className="wiz-btn w-full">
            광고주 등록 완료
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 