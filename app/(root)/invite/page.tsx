'use client';
import InvitationSuccess from '@/app/components/InvitePage/InvitationSuccess';
import ResendInvite from '@/app/components/InvitePage/ResendInvite';
import SetInvitePassword from '@/app/components/InvitePage/SetInvitePassword';
import { useState } from 'react';

export default function InvitePage() {
  const [pageType, setPageType] = useState<
    'resend' | 'setPassword' | 'success'
  >('setPassword');

  const renderPage = () => {
    switch (pageType) {
      case 'resend':
        return <ResendInvite setPageType={setPageType} />;
      case 'setPassword':
        return <SetInvitePassword setPageType={setPageType} />;
      case 'success':
        return <InvitationSuccess setPageType={setPageType} />;
      default:
        return <SetInvitePassword setPageType={setPageType} />;
    }
  };
  return <div>{renderPage()}</div>;
}
