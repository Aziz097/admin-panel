'use client';

import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import Image from 'next/image';

export default function NotFound() {
  const router = useRouter();

  return (
    <div className='absolute top-1/2 left-1/2 mb-1 -translate-x-1/2 -translate-y-1/2 items-center justify-center text-center'>

      <div className='flex justify-center'>
        <div className='relative w-100 h-60 flex items-center justify-center'>
          <Image 
            src="/not-found.png" 
            alt="Maskot petir yang terlihat sedih dan terputus koneksinya"
            className='w-full h-full object-contain drop-shadow-lg filter brightness-110'
          />
        </div>
      </div>

      <span className='bg-gradient-to-b from-sky-300 to-sky-600 bg-clip-text text-[8rem] leading-none font-extrabold text-transparent'>
        404
      </span>
      
      {/* Error Message */}
      <h2 className='font-heading my-2 text-2xl font-bold text-yellow-400'>
        Oops! Page Not Found
      </h2>
      <p className='text-slate-500 mb-2'>
        Sorry, the page you are looking for doesn&apos;t exist or has been moved.
      </p>
      <p className='text-slate-500 mb-8'>
        Our little lightning friend seems to have lost power too!
      </p>
      
      {/* Action Buttons */}
      <div className='mt-8 flex justify-center gap-2'>
        <Button onClick={() => router.back()} variant='default' size='lg' className='bg-sky-500 hover:bg-sky-600 text-white'>
          Go Back
        </Button>
        <Button
          onClick={() => router.push('/dashboard')}
          variant='ghost'
          size='lg'
          className='text-sky-500 hover:text-sky-600 hover:bg-sky-100'
        >
          Back to Home
        </Button>
      </div>
    </div>
  );
}