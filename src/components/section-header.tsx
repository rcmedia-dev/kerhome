import { cn } from "@/lib/utils";

const SectionHeader = ({ 
  title, 
  icon: Icon, 
  description,
  className,
  children 
}: { 
  title: string; 
  icon: any;
  description?: string;
  className?: string;
  children?: React.ReactNode;
}) => (
  <div className={cn("mb-6", className)}>
    <div className="flex items-center justify-between mb-2">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-gradient-to-r from-purple-100 to-orange-100 rounded-xl">
          <Icon className="w-5 h-5 text-purple-700" />
        </div>
        <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-700 to-orange-500 bg-clip-text text-transparent">
          {title}
        </h2>
      </div>
      {children}
    </div>
    {description && (
      <p className="text-gray-600 text-sm ml-11">{description}</p>
    )}
  </div>
);

export default SectionHeader;