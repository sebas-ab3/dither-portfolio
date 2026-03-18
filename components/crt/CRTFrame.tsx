import { CRTScreen } from './CRTScreen';

interface CRTFrameProps {
  children: React.ReactNode;
}

export function CRTFrame({ children }: CRTFrameProps) {
  return (
    <div className="crt-bezel min-h-screen">
      <CRTScreen>{children}</CRTScreen>
    </div>
  );
}
