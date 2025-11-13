import { BoostedProperty, trackBoostClick, trackBoostView } from "@/lib/functions/supabase-actions/boost-functions";
import { motion } from "framer-motion";
import { CheckCircle2, AlertCircle, XCircle, Target, Calendar, Eye, TrendingUp } from "lucide-react";
import { useEffect } from "react";

// Card para propriedades impulsionadas com tracking
const BoostedPropertyCard = ({ property, user }: { property: BoostedProperty; user: any }) => {
  const calculateTimeLeft = (expiresAt: string, boostStatus: string) => {
    if (boostStatus !== 'active') {
      return { 
        expired: true, 
        text: boostStatus === 'pending' ? 'Pendente' : 'Rejeitado',
        percentage: 0 
      };
    }

    const now = new Date();
    const expiry = new Date(expiresAt);
    const diff = expiry.getTime() - now.getTime();
    
    if (diff <= 0) return { expired: true, text: 'Expirado', percentage: 0 };
    
    // Calcular dias totais do plano para a porcentagem
    const boostStart = new Date(property.boost_started_at);
    const totalDuration = expiry.getTime() - boostStart.getTime();
    const totalDays = Math.floor(totalDuration / (1000 * 60 * 60 * 24));
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    const percentage = totalDays > 0 ? Math.max(0, Math.min(100, ((totalDays - days) / totalDays) * 100)) : 0;
    
    return { 
      expired: false, 
      text: `${days}d ${hours}h ${minutes}m`,
      days,
      hours,
      minutes,
      percentage
    };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-600';
      case 'pending':
        return 'bg-yellow-100 text-yellow-600';
      case 'rejected':
        return 'bg-red-100 text-red-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return CheckCircle2;
      case 'pending':
        return AlertCircle;
      case 'rejected':
        return XCircle;
      default:
        return AlertCircle;
    }
  };

  const getBoostTypeColor = (type: string) => {
    switch (type) {
      case 'premium':
        return 'bg-gradient-to-r from-yellow-500 to-orange-500';
      case 'featured':
        return 'bg-gradient-to-r from-purple-500 to-pink-500';
      default:
        return 'bg-gradient-to-r from-blue-500 to-cyan-500';
    }
  };

  // Função para track de clique
  const handleTrackClick = async () => {
    if (property.boost_status === 'active') {
      await trackBoostClick(property.property_id);
    }
  };

  // Função para track de visualização quando o card entra na viewport
  useEffect(() => {
    if (property.boost_status === 'active') {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            trackBoostView(property.property_id);
            observer.disconnect();
          }
        },
        { threshold: 0.5 }
      );

      const element = document.getElementById(`boosted-property-${property.id}`);
      if (element) {
        observer.observe(element);
      }

      return () => observer.disconnect();
    }
  }, [property.id, property.property_id, property.boost_status]);

  const timeLeft = calculateTimeLeft(property.boost_expires_at, property.boost_status);
  const StatusIcon = getStatusIcon(property.boost_status);

  return (
    <motion.div
      id={`boosted-property-${property.id}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden group hover:shadow-xl transition-all duration-300"
    >
      {/* Header com imagem e badges */}
      <div className="relative h-48 bg-gray-200 overflow-hidden">
        {property.images && property.images.length > 0 ? (
          <img
            src={property.images[0]}
            alt={property.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-100 to-orange-100">
            <Target className="w-12 h-12 text-purple-400" />
          </div>
        )}
        
        {/* Badge do tipo de boost */}
        <div className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold text-white ${getBoostTypeColor(property.boost_type)}`}>
          {property.boost_type.toUpperCase()}
        </div>

        {/* Badge de status */}
        <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${getStatusColor(property.boost_status)}`}>
          <StatusIcon size={12} />
          {property.boost_status === 'active' ? 'Ativo' : 
           property.boost_status === 'pending' ? 'Pendente' : 'Rejeitado'}
        </div>

        {/* Barra de progresso para boosts ativos */}
        {property.boost_status === 'active' && !timeLeft.expired && (
          <div className="absolute bottom-0 left-0 right-0 bg-gray-200 h-2">
            <div 
              className={`h-full ${
                timeLeft.percentage > 50 
                  ? 'bg-green-500' 
                  : timeLeft.percentage > 20 
                  ? 'bg-yellow-500' 
                  : 'bg-red-500'
              } transition-all duration-500`}
              style={{ width: `${timeLeft.percentage}%` }}
            />
          </div>
        )}
      </div>

      {/* Conteúdo */}
      <div className="p-4">
        <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 h-12">
          {property.title}
        </h3>
        
        <p className="text-sm text-gray-600 mb-3 line-clamp-1">
          {property.location}
        </p>

        <div className="flex items-center gap-1 text-sm text-gray-600 mb-3">
          <Calendar className="w-4 h-4" />
          <span>Iniciado em {new Date(property.boost_started_at).toLocaleDateString('pt-AO')}</span>
        </div>

        {/* Métricas de performance */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Eye className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-gray-600">Visualizações</span>
            </div>
            <p className="text-lg font-bold text-gray-900">{property.views.toLocaleString()}</p>
          </div>
          
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-center gap-1 mb-1">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-gray-600">Cliques</span>
            </div>
            <p className="text-lg font-bold text-gray-900">{property.clicks.toLocaleString()}</p>
          </div>
        </div>

        {/* Taxa de conversão */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-600">Taxa de Cliques</span>
            <span className="text-sm font-bold text-purple-600">
              {property.click_through_rate?.toFixed(1) || '0.0'}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-purple-500 to-orange-500 h-2 rounded-full transition-all duration-500"
              style={{ 
                width: `${property.click_through_rate || 0}%` 
              }}
            />
          </div>
        </div>

        {/* Informações do plano */}
        <div className="bg-gradient-to-r from-purple-50 to-orange-50 rounded-lg p-3 mb-4">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">Plano:</span>
            <span className="font-semibold text-gray-900">{property.boost_plan}</span>
          </div>
          <div className="flex justify-between items-center text-sm mt-2">
            <span className="text-gray-600">Tempo Restante:</span>
            <span className={`font-semibold ${
              timeLeft.expired ? 'text-red-600' : 'text-green-600'
            }`}>
              {timeLeft.text}
            </span>
          </div>
        </div>

        {/* Preço */}
        <div className="flex justify-between items-center">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full px-4 py-2 bg-gradient-to-r from-purple-600 to-orange-500 text-white rounded-lg text-sm font-semibold cursor-pointer"
            onClick={async () => {
              await handleTrackClick();
              window.open(`/propriedades/${property.property_id}`, '_blank');
            }}
          >
            Ver Detalhes
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default BoostedPropertyCard;