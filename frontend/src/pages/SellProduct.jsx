import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { ShoppingCart, Package, DollarSign, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react'
import axios from 'axios'
import { toast } from 'react-hot-toast'

const SellProduct = () => {
  const [selectedProduct, setSelectedProduct] = useState('')
  const [quantity, setQuantity] = useState('')
  const [description, setDescription] = useState('')
  const [totalPrice, setTotalPrice] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [validationErrors, setValidationErrors] = useState({})

  const queryClient = useQueryClient()

  // Fetch products available for sale
  const { 
    data: productsData, 
    isLoading: productsLoading, 
    error: productsError,
    refetch: refetchProducts 
  } = useQuery(
    'products-for-sale',
    async () => {
      try {
        const response = await axios.get('/api/sales/products')
        return response.data
      } catch (error) {
        console.error('Failed to fetch products:', error)
        throw new Error(error.response?.data?.error || 'Failed to load products')
      }
    },
    {
      retry: 3,
      retryDelay: 1000,
      staleTime: 30000, // 30 seconds
      refetchOnWindowFocus: false
    }
  )

  // Create sale mutation
  const createSaleMutation = useMutation(
    async (saleData) => {
      try {
        const response = await axios.post('/api/sales', saleData)
        return response.data
      } catch (error) {
        console.error('Sale creation failed:', error)
        throw new Error(error.response?.data?.error || 'Failed to complete sale')
      }
    },
    {
      onSuccess: (data) => {
        toast.success('Sale completed successfully!')
        setSelectedProduct('')
        setQuantity('')
        setDescription('')
        setTotalPrice(0)
        setValidationErrors({})
        
        // Invalidate related queries to refresh data
        queryClient.invalidateQueries('products')
        queryClient.invalidateQueries('finance-overview')
        queryClient.invalidateQueries('products-for-sale')
        
        // Show success details with profit information
        const profitMessage = `Sale completed: ${data.sale.product_name} x${data.sale.quantity} = ${formatCurrency(data.sale.total_price)} | Profit: ${formatCurrency(data.profit_generated)}`
        toast.success(profitMessage)
        
        // Show additional details in console for debugging
        console.log('Sale Details:', {
          product: data.sale.product_name,
          quantity: data.sale.quantity,
          totalPrice: data.income_generated,
          costPrice: data.cost_recorded,
          profit: data.profit_generated,
          stockRemaining: data.stock_remaining
        })
      },
      onError: (error) => {
        toast.error(error.message || 'Failed to complete sale')
        console.error('Sale error:', error)
      }
    }
  )

  // Calculate total price when product or quantity changes
  useEffect(() => {
    if (selectedProduct && quantity) {
      const product = productsData?.products?.find(p => p.id.toString() === selectedProduct)
      if (product) {
        const total = product.selling_price * parseInt(quantity)
        setTotalPrice(total)
      }
    } else {
      setTotalPrice(0)
    }
  }, [selectedProduct, quantity, productsData])

  // Validate form inputs
  const validateForm = () => {
    const errors = {}

    if (!selectedProduct) {
      errors.product = 'Please select a product'
    }

    if (!quantity) {
      errors.quantity = 'Please enter quantity'
    } else if (parseInt(quantity) <= 0) {
      errors.quantity = 'Quantity must be greater than 0'
    } else if (selectedProduct) {
      const product = productsData?.products?.find(p => p.id.toString() === selectedProduct)
      if (product && parseInt(quantity) > product.quantity) {
        errors.quantity = `Insufficient stock. Available: ${product.quantity}`
      }
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR'
    }).format(amount || 0)
  }

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    
    try {
      await createSaleMutation.mutateAsync({
        product_id: parseInt(selectedProduct),
        quantity: parseInt(quantity),
        description: description.trim() || null
      })
    } catch (error) {
      // Error is already handled by mutation
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle product selection change
  const handleProductChange = (e) => {
    setSelectedProduct(e.target.value)
    setQuantity('') // Reset quantity when product changes
    setValidationErrors({})
  }

  // Handle quantity change
  const handleQuantityChange = (e) => {
    const value = e.target.value
    setQuantity(value)
    setValidationErrors({})
  }

  // Get selected product details
  const selectedProductDetails = productsData?.products?.find(p => p.id.toString() === selectedProduct)

  // Handle retry for failed product fetch
  const handleRetryProducts = () => {
    refetchProducts()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Sell Product</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Select a product and complete the sale transaction.
        </p>
      </div>

      {/* Error State for Products */}
      {productsError && (
        <div className="card bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-600 mr-3" />
            <div className="flex-1">
              <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                Failed to load products
              </h3>
              <p className="text-sm text-red-600 dark:text-red-300 mt-1">
                {productsError.message}
              </p>
            </div>
            <button
              onClick={handleRetryProducts}
              className="flex items-center px-3 py-1 text-sm font-medium text-red-600 dark:text-red-300 hover:text-red-800 dark:hover:text-red-100"
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              Retry
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sale Form */}
        <div className="card">
          <div className="flex items-center mb-6">
            <ShoppingCart className="h-6 w-6 text-blue-600 mr-3" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Complete Sale</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Product Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Select Product
              </label>
              {productsLoading ? (
                <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-10 rounded-md"></div>
              ) : (
                <select
                  value={selectedProduct}
                  onChange={handleProductChange}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white ${
                    validationErrors.product 
                      ? 'border-red-300 dark:border-red-600' 
                      : 'border-gray-300 dark:border-gray-600'
                  }`}
                  required
                >
                  <option value="">Choose a product...</option>
                  {productsData?.products?.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name} - Stock: {product.quantity} - Price: {formatCurrency(product.selling_price)}
                    </option>
                  ))}
                </select>
              )}
              {validationErrors.product && (
                <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                  {validationErrors.product}
                </p>
              )}
            </div>

            {/* Quantity */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Quantity
              </label>
              <input
                type="number"
                value={quantity}
                onChange={handleQuantityChange}
                min="1"
                max={selectedProductDetails?.quantity || 999}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white ${
                  validationErrors.quantity 
                    ? 'border-red-300 dark:border-red-600' 
                    : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder="Enter quantity"
                required
              />
              {selectedProductDetails && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Available stock: {selectedProductDetails.quantity}
                </p>
              )}
              {validationErrors.quantity && (
                <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                  {validationErrors.quantity}
                </p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description (Optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Add any notes about this sale..."
              />
            </div>

            {/* Total Price Display */}
            {totalPrice > 0 && (
              <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Total Sale Price:</span>
                  <span className="text-lg font-bold text-blue-700 dark:text-blue-300">
                    {formatCurrency(totalPrice)}
                  </span>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || !selectedProduct || !quantity || parseInt(quantity) <= 0 || productsLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-md transition duration-200 flex items-center justify-center"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Processing...
                </>
              ) : (
                <>
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Complete Sale
                </>
              )}
            </button>
          </form>
        </div>

        {/* Product Details */}
        {selectedProductDetails && (
          <div className="card">
            <div className="flex items-center mb-6">
              <Package className="h-6 w-6 text-green-600 mr-3" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Product Details</h2>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  {selectedProductDetails.name}
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Unit Price</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {formatCurrency(selectedProductDetails.selling_price)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Available Stock</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {selectedProductDetails.quantity}
                  </p>
                </div>
              </div>

              {quantity && parseInt(quantity) > 0 && parseInt(quantity) <= selectedProductDetails.quantity && (
                <div className="bg-green-50 dark:bg-green-900 p-4 rounded-lg">
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                    <div>
                      <p className="text-sm font-medium text-green-700 dark:text-green-300">
                        Sale Summary
                      </p>
                      <p className="text-sm text-green-600 dark:text-green-400">
                        {quantity} × {formatCurrency(selectedProductDetails.selling_price)} = {formatCurrency(totalPrice)}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {quantity && parseInt(quantity) > selectedProductDetails.quantity && (
                <div className="bg-red-50 dark:bg-red-900 p-4 rounded-lg">
                  <div className="flex items-center">
                    <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
                    <div>
                      <p className="text-sm font-medium text-red-700 dark:text-red-300">
                        Insufficient Stock
                      </p>
                      <p className="text-sm text-red-600 dark:text-red-400">
                        You're trying to sell more than available stock
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Available Products List */}
      {productsData?.products?.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Available Products ({productsData.products.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {productsData.products.map((product) => (
              <div
                key={product.id}
                className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition duration-200"
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900 dark:text-white">{product.name}</h4>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Stock: {product.quantity}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Price: {formatCurrency(product.selling_price)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {productsData?.products?.length === 0 && !productsLoading && !productsError && (
        <div className="card">
          <div className="text-center py-8">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No Products Available
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              There are no products with stock available for sale.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default SellProduct 