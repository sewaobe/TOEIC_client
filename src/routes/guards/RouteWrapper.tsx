import { ComponentType } from 'react';

interface RouteWrapperProps {
  element: ComponentType;
  guard?: ComponentType<any>;
}

export const RouteWrapper = ({
  element: Element,
  guard: Guard,
}: RouteWrapperProps) => {
  const content = <Element />;

  if (!Guard) {
    console.log('No guard applied.'); // Xác nhận không có guard nào được áp dụng

    return content;
  }
  console.log('Applying guard:', Guard.name); // Kiểm tra xem guard nào đang được áp dụng

  return <Guard>{content}</Guard>;
};
