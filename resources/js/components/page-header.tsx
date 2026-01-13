import { Card, CardContent } from '@/components/ui/card';
import { ReactNode } from 'react';

interface PageHeaderProps {
    title: ReactNode;
    description?: ReactNode;
    actions?: ReactNode;
}

export default function PageHeader({ title, description, actions }: PageHeaderProps) {
    return (
        <Card>
            <CardContent className="p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-bold text-foreground">{title}</h1>
                        {description && <p className="text-muted-foreground">{description}</p>}
                    </div>
                    {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
                </div>
            </CardContent>
        </Card>
    );
}
