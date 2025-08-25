import { Building2, CheckCircle, DollarSign, LucideIcon,  TrendingDown, TrendingUp, UserPlus, Users } from "lucide-react";
import { Area, AreaChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";



 // Dados de exemplo para os gráficos
const revenueData = [
    { month: 'Jan', revenue: 45000, properties: 120 },
    { month: 'Fev', revenue: 52000, properties: 145 },
    { month: 'Mar', revenue: 48000, properties: 132 },
    { month: 'Abr', revenue: 61000, properties: 167 },
    { month: 'Mai', revenue: 55000, properties: 151 },
    { month: 'Jun', revenue: 67000, properties: 189 }
  ];

    const propertyTypeData = [
    { name: 'Apartamentos', value: 45, color: '#8B5CF6' },
    { name: 'Casas', value: 30, color: '#F59E0B' },
    { name: 'Terrenos', value: 15, color: '#10B981' },
    { name: 'Comercial', value: 10, color: '#EF4444' }
  ];

    const userGrowthData = [
    { month: 'Jan', users: 1200, agents: 45 },
    { month: 'Fev', users: 1450, agents: 52 },
    { month: 'Mar', users: 1680, agents: 48 },
    { month: 'Abr', users: 1920, agents: 61 },
    { month: 'Mai', users: 2150, agents: 58 },
    { month: 'Jun', users: 2380, agents: 67 }
  ];


  const properties = [
    { id: 1, title: 'Apartamento T3 Luanda Sul', agent: 'João Silva', price: '450.000', status: 'pending', type: 'Apartamento' },
    { id: 2, title: 'Casa Moderna Talatona', agent: 'Maria Santos', price: '780.000', status: 'approved', type: 'Casa' },
    { id: 3, title: 'Terreno Comercial Maianga', agent: 'Pedro Costa', price: '320.000', status: 'pending', type: 'Terreno' },
    { id: 4, title: 'Loja Centro Comercial', agent: 'Ana Ferreira', price: '150.000', status: 'rejected', type: 'Comercial' }
  ];

  const users = [
    { id: 1, name: 'Carlos Mendes', email: 'carlos@email.com', type: 'Cliente', joined: '2024-06-15', status: 'active' },
    { id: 2, name: 'Sofia Rodrigues', email: 'sofia@email.com', type: 'Agente', joined: '2024-05-20', status: 'active' },
    { id: 3, name: 'Miguel Torres', email: 'miguel@email.com', type: 'Cliente', joined: '2024-06-10', status: 'inactive' },
    { id: 4, name: 'Isabel Nunes', email: 'isabel@email.com', type: 'Parceiro', joined: '2024-04-12', status: 'active' }
  ];

type RenderDashboardProps = {
    darkMode: boolean;
}

export function RenderDashboard( { darkMode }: RenderDashboardProps){
    return(

    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Imóveis Ativos" 
          value="1,245" 
          change={12} 
          icon={Building2} 
          color="purple" 
        />
        <StatCard 
          title="Utilizadores Registados" 
          value="2,380" 
          change={8} 
          icon={Users} 
          color="orange" 
        />
        <StatCard 
          title="Receita Mensal" 
          value="67.000 Kz" 
          change={15} 
          icon={DollarSign} 
          color="green" 
        />
        <StatCard 
          title="Agentes Ativos" 
          value="67" 
          change={5} 
          icon={UserPlus} 
          color="blue" 
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className={`p-6 rounded-xl border shadow-sm ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Receita e Imóveis</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#E5E7EB'} />
              <XAxis dataKey="month" stroke={darkMode ? '#9CA3AF' : '#6B7280'} />
              <YAxis stroke={darkMode ? '#9CA3AF' : '#6B7280'} />
              <Tooltip 
                contentStyle={{
                  backgroundColor: darkMode ? '#374151' : '#FFFFFF',
                  border: `1px solid ${darkMode ? '#4B5563' : '#E5E7EB'}`,
                  borderRadius: '8px',
                  color: darkMode ? '#FFFFFF' : '#000000'
                }}
              />
              <Line type="monotone" dataKey="revenue" stroke="#8B5CF6" strokeWidth={3} dot={{ fill: '#8B5CF6' }} />
              <Line type="monotone" dataKey="properties" stroke="#F59E0B" strokeWidth={3} dot={{ fill: '#F59E0B' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Property Types */}
        <div className={`p-6 rounded-xl border shadow-sm ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Tipos de Imóveis</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={propertyTypeData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}%`}
              >
                {propertyTypeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* User Growth Chart */}
      <div className={`p-6 rounded-xl border shadow-sm ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Crescimento de Utilizadores</h3>
        <ResponsiveContainer width="100%" height={350}>
          <AreaChart data={userGrowthData}>
            <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#E5E7EB'} />
            <XAxis dataKey="month" stroke={darkMode ? '#9CA3AF' : '#6B7280'} />
            <YAxis stroke={darkMode ? '#9CA3AF' : '#6B7280'} />
            <Tooltip 
              contentStyle={{
                backgroundColor: darkMode ? '#374151' : '#FFFFFF',
                border: `1px solid ${darkMode ? '#4B5563' : '#E5E7EB'}`,
                borderRadius: '8px',
                color: darkMode ? '#FFFFFF' : '#000000'
              }}
            />
            <Area type="monotone" dataKey="users" stackId="1" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.6} />
            <Area type="monotone" dataKey="agents" stackId="2" stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.6} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Recent Activity */}
      <div className={`p-6 rounded-xl border shadow-sm ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Atividade Recente</h3>
        <div className="space-y-4">
          {[
            { id: 1, action: 'Novo imóvel cadastrado', user: 'João Silva', time: '10 min', icon: Building2, color: 'purple' },
            { id: 2, action: 'Pagamento confirmado', user: 'Maria Santos', time: '25 min', icon: DollarSign, color: 'green' },
            { id: 3, action: 'Novo agente registrado', user: 'Pedro Costa', time: '1h', icon: UserPlus, color: 'blue' },
            { id: 4, action: 'Denúncia resolvida', user: 'Ana Ferreira', time: '2h', icon: CheckCircle, color: 'green' }
          ].map((activity) => {
            const Icon = activity.icon;
            return (
              <div key={activity.id} className={`flex items-center p-3 rounded-lg ${darkMode ? 'bg-gray-750' : 'bg-gray-50'}`}>
                <div className={`p-2 rounded-lg mr-4 ${activity.color === 'purple' ? 'bg-purple-100 text-purple-600' : activity.color === 'green' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'} ${darkMode ? 'bg-opacity-20' : ''}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{activity.action}</p>
                  <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Por {activity.user}</p>
                </div>
                <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{activity.time}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
    )
}


interface StatCardProps {
    title: string;
    value: string | number;
    change: number;
    icon: LucideIcon;  // o tipo para componente de ícone (React component)
    color?: "purple" | "orange" | "green" | "blue";
    darkMode?: boolean; // você está usando `darkMode` mas não veio no props, tem que incluir
}

const StatCard: React.FC<StatCardProps> = ({ title, value, change, icon: Icon, color = "purple", darkMode = false }) => (
    <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} p-6 rounded-xl border shadow-sm hover:shadow-md transition-all duration-200`}>
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{title}</p>
          <p className={`text-2xl font-bold mt-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{value}</p>
          <div className="flex items-center mt-2 text-sm">
            {change > 0 ? (
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
            )}
            <span className={change > 0 ? 'text-green-500' : 'text-red-500'}>
              {Math.abs(change)}%
            </span>
            <span className={`ml-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>vs mês anterior</span>
          </div>
        </div>
        <div className={`p-3 rounded-lg ${color === 'purple' ? 'bg-purple-100 text-purple-600' : color === 'orange' ? 'bg-orange-100 text-orange-600' : color === 'green' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'} ${darkMode ? 'bg-opacity-20' : ''}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );