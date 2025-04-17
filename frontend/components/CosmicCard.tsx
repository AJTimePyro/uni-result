import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './ui/card';

interface CosmicCardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

const CosmicCard: React.FC<CosmicCardProps> = ({
  title,
  description,
  children,
  footer,
  className,
}) => {
  return (
    <Card cosmic className={className}>
      <CardHeader cosmic>
        <CardTitle cosmic>{title}</CardTitle>
        {description && <CardDescription cosmic>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
      {footer && <CardFooter>{footer}</CardFooter>}
    </Card>
  );
};

export default CosmicCard; 