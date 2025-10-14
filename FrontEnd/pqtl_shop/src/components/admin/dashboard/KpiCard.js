import React, { useState } from 'react';
import { 
  BarChart3, Package, TrendingUp, AlertTriangle, 
  Users, ShoppingCart, Search, Bell, Menu, X,
  ChevronRight, DollarSign, ArrowUpRight, ArrowDownRight,
  Clock, Box, Archive, Leaf, AlertCircle
} from 'lucide-react';
const KpiCard = ({ icon: Icon, title, value, change, color, subtitle }) => (
  <div className="bg-white rounded-2xl shadow-sm p-6 hover:shadow-md transition-all border border-gray-100">
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <p className="text-gray-600 text-sm font-medium mb-2">{title}</p>
        <h3 className="text-3xl font-bold text-gray-900 mb-1">{value}</h3>
        {subtitle && <p className="text-sm text-gray-500 mb-2">{subtitle}</p>}
        {change !== undefined && (
          <div className="flex items-center mt-2">
            {change > 0 ? (
              <ArrowUpRight className="w-4 h-4 text-green-500 mr-1" />
            ) : (
              <ArrowDownRight className="w-4 h-4 text-red-500 mr-1" />
            )}
            <span className={`text-sm font-semibold ${change > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {Math.abs(change)}%
            </span>
          </div>
        )}
      </div>
      <div className={`p-4 rounded-xl ${color}`}>
        <Icon className="w-7 h-7 text-white" />
      </div>
    </div>
  </div>
);
export default KpiCard;