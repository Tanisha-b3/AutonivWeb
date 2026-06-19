// components/Modal.tsx - Enhanced Version with Green Theme
import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function Modal({ isOpen, onClose, title, children, footer, size = 'md' }: ModalProps) {
  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-3 sm:p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel
                className={`w-full ${sizes[size]} transform overflow-hidden rounded-2xl border shadow-2xl transition-all`}
                style={{ 
                  borderColor: 'rgba(16,185,129,0.15)',
                  background: 'linear-gradient(160deg, #0f172a 0%, #090d16 50%, #0a0f1a 100%)',
                  boxShadow: '0 25px 60px rgba(0,0,0,0.8), 0 0 40px rgba(16,185,129,0.05), inset 0 1px 0 rgba(16,185,129,0.08)'
                }}
              >
                {/* Green glow effect */}
                <div style={{
                  position: 'absolute',
                  top: '-50%',
                  right: '-30%',
                  width: '400px',
                  height: '400px',
                  background: 'radial-gradient(circle, rgba(16,185,129,0.04), rgba(16,185,129,0.02) 50%, transparent 70%)',
                  pointerEvents: 'none',
                  borderRadius: '50%',
                }} />
                <div style={{
                  position: 'absolute',
                  bottom: '-40%',
                  left: '-20%',
                  width: '300px',
                  height: '300px',
                  background: 'radial-gradient(circle, rgba(16,185,129,0.03), transparent 70%)',
                  pointerEvents: 'none',
                  borderRadius: '50%',
                }} />

                <div
                  className="flex items-center justify-between p-4 sm:p-6 relative z-10"
                  style={{ borderBottom: '1px solid rgba(16,185,129,0.08)' }}
                >
                  <Dialog.Title 
                    className="text-lg sm:text-xl font-bold"
                    style={{ 
                      color: '#10b981',
                    }}
                  >
                    {title}
                  </Dialog.Title>
                  <button
                    onClick={onClose}
                    className="p-1.5 rounded-lg transition-all duration-200"
                    style={{ 
                      color: 'rgba(148,175,210,0.5)',
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.06)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = '#e2e8f0';
                      e.currentTarget.style.background = 'rgba(16,185,129,0.08)';
                      e.currentTarget.style.borderColor = 'rgba(16,185,129,0.2)';
                      e.currentTarget.style.transform = 'scale(1.05)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = 'rgba(148,175,210,0.5)';
                      e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
                      e.currentTarget.style.transform = 'scale(1)';
                    }}
                  >
                    <XMarkIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                  </button>
                </div>
                
                <div className="p-4 sm:p-6 max-h-[80vh] overflow-y-auto relative z-10">
                  {/* Content wrapper with subtle styling */}
                  <div className="prose prose-invert max-w-none" style={{ color: '#e2e8f0' }}>
                    {children}
                  </div>
                </div>
                
                {footer && (
                  <div
                    className="flex justify-end gap-2 sm:gap-3 p-4 sm:p-6 relative z-10"
                    style={{ 
                      borderTop: '1px solid rgba(16,185,129,0.08)',
                      background: 'rgba(255,255,255,0.02)',
                    }}
                  >
                    {footer}
                  </div>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

// Helper function to create styled footer buttons - Green Theme
export function ModalButton({ 
  children, 
  variant = 'primary', 
  onClick,
  ...props 
}: { 
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger';
  onClick?: () => void;
  [key: string]: any;
}) {
  const styles = {
    primary: {
      background: 'linear-gradient(135deg, #10b981, #059669)',
      backgroundSize: '200% 200%',
      color: '#ffffff',
      border: 'none',
      boxShadow: '0 4px 16px rgba(16,185,129,0.25)',
    },
    secondary: {
      background: 'rgba(255,255,255,0.04)',
      color: '#94a3b8',
      border: '1px solid rgba(255,255,255,0.08)',
    },
    danger: {
      background: 'rgba(239,68,68,0.12)',
      color: '#ef4444',
      border: '1px solid rgba(239,68,68,0.2)',
    }
  };

  const currentStyle = styles[variant];

  return (
    <button
      onClick={onClick}
      style={{
        padding: '8px 20px',
        borderRadius: '10px',
        fontSize: '13px',
        fontWeight: 600,
        cursor: 'pointer',
        transition: 'all 0.3s cubic-bezier(.16,1,.3,1)',
        ...currentStyle,
      }}
      onMouseEnter={(e) => {
        if (variant === 'primary') {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 8px 24px rgba(16,185,129,0.35)';
          e.currentTarget.style.backgroundPosition = '100% 100%';
        } else if (variant === 'secondary') {
          e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)';
          e.currentTarget.style.color = '#e2e8f0';
        } else if (variant === 'danger') {
          e.currentTarget.style.background = 'rgba(239,68,68,0.2)';
          e.currentTarget.style.borderColor = 'rgba(239,68,68,0.3)';
        }
      }}
      onMouseLeave={(e) => {
        if (variant === 'primary') {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 4px 16px rgba(16,185,129,0.25)';
          e.currentTarget.style.backgroundPosition = '0% 0%';
        } else if (variant === 'secondary') {
          e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
          e.currentTarget.style.color = '#94a3b8';
        } else if (variant === 'danger') {
          e.currentTarget.style.background = 'rgba(239,68,68,0.12)';
          e.currentTarget.style.borderColor = 'rgba(239,68,68,0.2)';
        }
      }}
      {...props}
    >
      {children}
    </button>
  );
}