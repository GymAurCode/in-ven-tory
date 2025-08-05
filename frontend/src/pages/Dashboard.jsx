import { useQuery } from 'react-query'
import { 
  Package, 
  ShoppingCart,
  DollarSign, 
  TrendingUp, 
  Users,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'
import axios from 'axios'
import moment from 'moment'

const Dashboard = () => {
  const { data: financeData } = useQuery('finance-overview', async () => {
    const response = await axios.get('/api/finance/overview')
    return response.data
  })

  const { data: productsData } = useQuery('products', async () => {
    const response = await axios.get('/api/products')
    return response.data
  })

  const { data: expensesData } = useQuery('expenses', async () => {
    const response = await axios.get('/api/expenses')
    return response.data
  })

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR'
    }).format(amount || 0)
  }

  // Filter products to show only stock products (quantity > 0)
  const stockProducts = productsData?.products?.filter(product => product.quantity > 0) || []

  const stats = [
    {
      name: 'Stock Products',
      value: financeData?.stockProductsCount || 0,
      icon: Package,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900',
      description: 'Products with available stock'
    },
    {
      name: 'Sold Products',
      value: financeData?.distinctSoldProducts || 0,
      icon: ShoppingCart,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100 dark:bg-orange-900',
      description: 'Unique products sold'
    },
    {
      name: 'Sales Income',
      value: formatCurrency(financeData?.income || 0),
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900',
      description: 'Income from sales only'
    },
    {
      name: 'Net Profit',
      value: formatCurrency(financeData?.netProfit || 0),
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100 dark:bg-purple-900',
      description: 'Profit from sales minus expenses'
    }
  ]

  const recentStockProducts = stockProducts.slice(0, 5)
  const recentExpenses = expensesData?.expenses?.slice(0, 5) || []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Welcome back! Here's what's happening with your business.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="card">
            <div className="flex items-center">
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {stat.name}
                </p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {stat.value}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {stat.description}
                </p>
                {stat.change && (
                  <div className="flex items-center mt-1">
                    {stat.changeType === 'positive' ? (
                      <ArrowUpRight className="h-4 w-4 text-green-600" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4 text-red-600" />
                    )}
                    <span className={`text-sm ml-1 ${
                      stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {stat.change}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Product Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stock Products */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Stock Products
            </h3>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {financeData?.stockProductsCount || 0} products with stock
            </span>
          </div>
          <div className="space-y-3">
            {recentStockProducts.map((product) => (
              <div key={product.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{product.name}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Stock: {product.quantity} | Price: {formatCurrency(product.selling_price)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900 dark:text-white">
                    {formatCurrency(product.cost_price)}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Cost Price
                  </p>
                </div>
              </div>
            ))}
            {recentStockProducts.length === 0 && (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                No products in stock
              </p>
            )}
          </div>
        </div>

        {/* Sold Products */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Sold Products
            </h3>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {financeData?.distinctSoldProducts || 0} products sold
            </span>
          </div>
          <div className="space-y-3">
            {financeData?.distinctSoldProducts > 0 ? (
              <div className="text-center py-8">
                <ShoppingCart className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Sales Activity
                </h4>
                <p className="text-gray-600 dark:text-gray-400">
                  {financeData.totalSold} units sold across {financeData.distinctSoldProducts} products
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  Total sales: {financeData.totalSales} transactions
                </p>
                <p className="text-sm text-green-600 dark:text-green-400 mt-2">
                  Income generated: {formatCurrency(financeData.income)}
                </p>
              </div>
            ) : (
              <div className="text-center py-8">
                <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No Sales Yet
                </h4>
                <p className="text-gray-600 dark:text-gray-400">
                  Start selling products to see sales activity here
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Financial Summary */}
      {financeData && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Financial Summary (From Sales Only)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">Donation (2%)</p>
              <p className="text-2xl font-bold text-blue-600">
                {formatCurrency(financeData.donation)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">Partner A Share</p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(financeData.partnerAShare)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">Partner B Share</p>
              <p className="text-2xl font-bold text-purple-600">
                {formatCurrency(financeData.partnerBShare)}
              </p>
            </div>
          </div>
          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              <strong>Note:</strong> Income and profit are calculated only from product sales. 
              Adding products to stock does not affect income or profit calculations.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard 