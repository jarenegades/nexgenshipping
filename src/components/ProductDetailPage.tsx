import { Star, ShoppingCart, ChevronLeft, Package, Truck, Shield, Lock, Heart } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Product } from './ProductCard';
import { useState, useEffect } from 'react';
import { Currency, convertCurrency, formatCurrency } from '../utils/currencyService';
import { ReviewsSection } from './ReviewsSection';
import { reviewsService } from '../utils/reviewsService';
import { productsService } from '../utils/productsService';
import { bearingCategoryLabel } from '../utils/bearingCatalog';

interface ProductDetailPageProps {
  product?: Product | null;
  isLoggedIn: boolean;
  onAddToCart: (productId: string) => void;
  onBuyNow: (productId: string) => void;
  onToggleWishlist?: (product: Product) => void;
  isInWishlist?: (productId: string) => boolean;
  onBack: () => void;
  onLoginPrompt: () => void;
  selectedCurrency?: Currency;
}

export function ProductDetailPage({
  product,
  isLoggedIn,
  onAddToCart,
  onBuyNow,
  onToggleWishlist,
  isInWishlist,
  onBack,
  onLoginPrompt,
  selectedCurrency = 'USD',
}: ProductDetailPageProps) {
  const { id } = useParams<{ id: string }>();
  const [fetchedProduct, setFetchedProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(!product);
  
  const displayProduct = product || fetchedProduct;

  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [calculatedRating, setCalculatedRating] = useState(displayProduct?.rating || 0);
  const [reviewCount, setReviewCount] = useState(displayProduct?.reviewCount || 0);

  // Fetch product if not provided via props (direct navigation)
  useEffect(() => {
    const fetchProduct = async () => {
      if (!product && id) {
        setLoading(true);
        try {
          const found = await productsService.getById(id);
          if (found) {
            setFetchedProduct(found);
            setCalculatedRating(found.rating);
            setReviewCount(found.reviewCount);
          }
        } catch (error) {
          console.error('Error fetching product:', error);
        } finally {
          setLoading(false);
        }
      } else if (product) {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [product, id]);

  // Load calculated average rating from reviews
  useEffect(() => {
    if (!displayProduct) return;
    
    const loadAverageRating = async () => {
      const { averageRating, reviewCount: count } = await reviewsService.getAverageRating(displayProduct.id);
      if (count > 0) {
        setCalculatedRating(averageRating);
        setReviewCount(count);
      }
    };
    loadAverageRating();
  }, [displayProduct?.id]);

  const handleRatingUpdated = async () => {
    if (!displayProduct) return;
    const { averageRating, reviewCount: count } = await reviewsService.getAverageRating(displayProduct.id);
    setCalculatedRating(averageRating);
    setReviewCount(count);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#003366]"></div>
      </div>
    );
  }

  if (!displayProduct) {
    return (
      <div className="max-w-[1400px] mx-auto px-4 py-12 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h2>
        <Button onClick={onBack} variant="outline">Back to Products</Button>
      </div>
    );
  }

  // Convert prices to selected currency
  const productCurrency = displayProduct.currency || 'USD';
  const displayPrice = convertCurrency(displayProduct.price, productCurrency, selectedCurrency);
  const displayOriginalPrice = displayProduct.originalPrice 
    ? convertCurrency(displayProduct.originalPrice, productCurrency, selectedCurrency)
    : undefined;
  const savings = displayOriginalPrice ? displayOriginalPrice - displayPrice : 0;

  // Generate additional product images (using the same image for demo)
  const productImages = [
    displayProduct.image,
    displayProduct.image,
    displayProduct.image,
    displayProduct.image,
  ];

  const handleQuantityChange = (change: number) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= 10) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      onAddToCart(displayProduct.id);
    }
  };

  const handleBuyNow = () => {
    for (let i = 0; i < quantity; i++) {
      onAddToCart(displayProduct.id);
    }
    onBuyNow(displayProduct.id);
  };

  const productInWishlist = isInWishlist?.(displayProduct.id) ?? false;

  return (
    <div className="max-w-[1400px] mx-auto px-4 py-6">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-[#003366] hover:text-[#0055AA] mb-6 transition-colors"
      >
        <ChevronLeft className="h-5 w-5" />
        <span>Back to Products</span>
      </button>

      <div className="grid md:grid-cols-2 gap-8 mb-12">
        {/* Image Gallery */}
        <div className="space-y-4">
          {/* Main Image */}
          <div className="relative bg-white rounded-lg border border-gray-200 p-4">
            <ImageWithFallback
              src={productImages[selectedImage]}
              alt={displayProduct.name}
              className="w-full h-96 md:h-[500px] object-contain"
            />
            {displayProduct.badge && (
              <Badge className="absolute top-6 left-6 bg-[#DC143C] hover:bg-[#B01030] transition-colors text-white border-0">
                {displayProduct.badge}
              </Badge>
            )}
          </div>

          {/* Thumbnail Images */}
          <div className="grid grid-cols-4 gap-2">
            {productImages.map((image, index) => (
              <button
                key={index}
                onClick={() => setSelectedImage(index)}
                className={`bg-white rounded border-2 p-2 transition-all ${
                  selectedImage === index
                    ? 'border-[#FF9900]'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <ImageWithFallback
                  src={image}
                  alt={`${displayProduct.name} view ${index + 1}`}
                  className="w-full h-20 object-contain"
                />
              </button>
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <div className="flex items-start justify-between gap-4 mb-2">
              <h1 className="text-gray-900">{displayProduct.name}</h1>
              {onToggleWishlist && (
                <button
                  onClick={() => onToggleWishlist(displayProduct)}
                  className="shrink-0 bg-white hover:bg-gray-50 border border-gray-200 rounded-full p-2 transition-colors"
                  title={productInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
                  aria-label={productInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
                >
                  <Heart className={`h-5 w-5 ${productInWishlist ? 'text-[#DC143C] fill-[#DC143C]' : 'text-gray-500'}`} />
                </button>
              )}
            </div>
            
            {/* Rating */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${
                      i < Math.floor(calculatedRating)
                        ? 'fill-[#FF9900] text-[#FF9900]'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-[#003366]">{calculatedRating.toFixed(1)} out of 5</span>
              <span className="text-sm text-blue-600 hover:text-[#C7511F] cursor-pointer">
                {reviewCount} {reviewCount === 1 ? 'rating' : 'ratings'}
              </span>
            </div>

            <div className="h-px bg-gray-200 mb-4" />

            {/* Price */}
            <div className="mb-6">
              {isLoggedIn ? (
                <div className="space-y-2">
                  <div className="flex items-baseline gap-3">
                    {displayOriginalPrice && (
                      <span className="text-sm text-gray-500">
                        List Price: <span className="line-through">{formatCurrency(displayOriginalPrice, selectedCurrency)}</span>
                      </span>
                    )}
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm text-gray-700">Price:</span>
                    <span className="text-[#DC143C] text-3xl">
                      {formatCurrency(displayPrice, selectedCurrency)}
                    </span>
                  </div>
                  {displayOriginalPrice && savings > 0 && (
                    <div className="text-sm text-green-700">
                      You Save: {formatCurrency(savings, selectedCurrency)} (
                      {Math.round((savings / displayOriginalPrice) * 100)}%)
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2 text-gray-600 bg-gray-50 border border-gray-200 rounded p-4">
                  <Lock className="h-5 w-5" />
                  <span>Sign in to see price and purchase this item</span>
                </div>
              )}
            </div>

            <div className="h-px bg-gray-200 mb-6" />

            {/* Stock Status */}
            <div className="mb-6">
              {displayProduct.inStock ? (
                <div className="flex items-center gap-2 text-green-700">
                  <Package className="h-5 w-5" />
                  <span className="text-lg">In Stock</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-red-600">
                  <Package className="h-5 w-5" />
                  <span className="text-lg">Currently Out of Stock</span>
                </div>
              )}
            </div>

            {/* Quantity Selector */}
            {isLoggedIn && displayProduct.inStock && (
              <div className="mb-6">
                <label className="block text-sm text-gray-700 mb-2">Quantity:</label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleQuantityChange(-1)}
                    className="bg-gray-200 hover:bg-gray-300 w-10 h-10 rounded flex items-center justify-center transition-colors"
                  >
                    -
                  </button>
                  <span className="w-12 text-center text-lg">{quantity}</span>
                  <button
                    onClick={() => handleQuantityChange(1)}
                    className="bg-gray-200 hover:bg-gray-300 w-10 h-10 rounded flex items-center justify-center transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3 mb-6">
              {isLoggedIn ? (
                <>
                  <Button
                    onClick={handleAddToCart}
                    disabled={!displayProduct.inStock}
                    className="w-full bg-[#FFD814] hover:bg-[#F7CA00] text-gray-900 h-12 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ShoppingCart className="h-5 w-5 mr-2" />
                    Add to Cart
                  </Button>
                  <Button
                    onClick={handleBuyNow}
                    disabled={!displayProduct.inStock}
                    className="w-full bg-[#FF9900] hover:bg-[#F08000] text-white h-12 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Buy Now
                  </Button>
                </>
              ) : (
                <Button
                  onClick={onLoginPrompt}
                  className="w-full bg-[#FFD814] hover:bg-[#F7CA00] text-gray-900 h-12 transition-colors"
                >
                  Sign in to purchase
                </Button>
              )}
            </div>

            <div className="h-px bg-gray-200 mb-6" />

            {/* Features */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm text-gray-700">
                <Truck className="h-5 w-5 text-[#007600]" />
                <span>Fast, reliable worldwide shipping</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-700">
                <Shield className="h-5 w-5 text-[#003366]" />
                <span>30-day return policy</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-700">
                <Package className="h-5 w-5 text-[#DC143C]" />
                <span>Quality guaranteed</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Product Details */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 md:p-8 mb-8">
        <h2 className="text-[#003366] mb-4">Product Details</h2>
        <div className="space-y-4 text-gray-700">
          <div>
            <h3 className="text-[#003366] mb-2">About This Item</h3>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Industrial-grade bearing component selected for dependable equipment performance</li>
              <li>Designed to support specified radial, axial or combined loads</li>
              <li>Suitable for maintenance, replacement and OEM applications</li>
              <li>Confirm dimensions, fitment, speed and load requirements before ordering</li>
              <li>Technical product support and worldwide shipping are available</li>
            </ul>
          </div>

          <div>
            <h3 className="text-[#003366] mb-2">Product Information</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <span className="text-gray-600">Category:</span>
                <span className="ml-2">{bearingCategoryLabel(displayProduct.category)}</span>
              </div>
              <div>
                <span className="text-gray-600">Product ID:</span>
                <span className="ml-2">{displayProduct.id}</span>
              </div>
              <div>
                <span className="text-gray-600">Availability:</span>
                <span className="ml-2">{displayProduct.inStock ? 'In Stock' : 'Out of Stock'}</span>
              </div>
              <div>
                <span className="text-gray-600">Rating:</span>
                <span className="ml-2">{displayProduct.rating} / 5.0</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Reviews */}
      <ReviewsSection 
        productId={displayProduct.id} 
        isLoggedIn={isLoggedIn} 
        onLoginPrompt={onLoginPrompt}
        onRatingUpdated={handleRatingUpdated}
      />
    </div>
  );
}
