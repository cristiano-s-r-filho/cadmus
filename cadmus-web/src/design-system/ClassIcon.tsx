import { 
  FileText, 
  CheckSquare, 
  Briefcase, 
  Gem, 
  Table, 
  Box, 
  User,
  Wallet
} from 'lucide-react';

interface ClassIconProps {
    classId?: string;
    className?: string;
}

export const ClassIcon: React.FC<ClassIconProps> = ({ classId, className }) => {
    switch (classId) {
        case 'task': return <CheckSquare className={className} />;
        case 'project': return <Briefcase className={className} />;
        case 'asset': return <Gem className={className} />;
        case 'ledger': return <Wallet className={className} />;
        case 'container': return <Box className={className} />;
        case 'profile': return <User className={className} />;
        case 'folha': return <Table className={className} />;
        default: return <FileText className={className} />;
    }
};
