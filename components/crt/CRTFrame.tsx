import { CRTScreen } from './CRTScreen';

interface CRTFrameProps {
  children: React.ReactNode;
}

export function CRTFrame({ children }: CRTFrameProps) {
  return (
    <div className="crt-bezel">
      <CRTScreen>{children}</CRTScreen>
    </div>
  );
}
