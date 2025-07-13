import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ChevronLeft, ChevronRight, Star, User, MapPin, Calendar, Shield, Heart, Share2, Loader2, ArrowLeft } from "lucide-react";
import Header from "@/components/Header";
import { MessageButton } from "@/components/MessageButton";
import { useMarketplace } from "@/contexts/MarketplaceContext";
import { MarketplaceProvider } from "@/contexts/MarketplaceContext";

const ItemDetailContent = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const {
    currentItem: item,
    loadingItem,
    similarItems,
    loadItem,
    loadSimilarItems,
    saveItem,
    markAsViewed
  } = useMarketplace();

  useEffect(() => {
    if (id) {
      loadItem(id);
      loadSimilarItems(id);
      markAsViewed(id);
    }
  }, [id]);

  useEffect(() => {
    if (item && item.images && item.images.length > 0) {
      setCurrentImageIndex(0);
    }
  }, [item]);

  const nextImage = () => {
    if (item?.images) {
      setCurrentImageIndex((prev) => (prev + 1) % item.images.length);
    }
  };

  const prevImage = () => {
    if (item?.images) {
      setCurrentImageIndex((prev) => (prev - 1 + item.images.length) % item.images.length);
    }
  };

  const handleSaveItem = async () => {
    if (item) {
      await saveItem(item.id);
    }
  };

  const handleSimilarItemClick = (itemId: string) => {
    navigate(`/marketplace/item/${itemId}`);
  };

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    const diffInWeeks = Math.floor(diffInDays / 7);
    return `${diffInWeeks}w ago`;
  };

  if (loadingItem) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center min-h-[400px]">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold mb-4">Item not found</h2>
            <p className="text-muted-foreground mb-6">
              The item you're looking for doesn't exist or has been removed.
            </p>
            <Button onClick={() => navigate('/marketplace')} variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Marketplace
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <button 
            onClick={() => navigate('/marketplace')}
            className="hover:text-primary transition-colors"
          >
            Marketplace
          </button>
          <span>•</span>
          <span>{item.category}</span>
          <span>•</span>
          <span className="text-foreground">{item.title}</span>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Image Carousel */}
          <div className="space-y-4">
            <Card className="overflow-hidden">
              <div className="relative aspect-[4/3] bg-muted">
                <img
                  src={item.images[currentImageIndex]}
                  alt={`${item.title} - Image ${currentImageIndex + 1}`}
                  className="w-full h-full object-cover"
                />
                
                {item.images.length > 1 && (
                  <>
                    <Button
                      variant="outline"
                      size="icon"
                      className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-background/80 backdrop-blur-sm"
                      onClick={prevImage}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="icon"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-background/80 backdrop-blur-sm"
                      onClick={nextImage}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </>
                )}

                <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1">
                  {item.images.map((_, index) => (
                    <button
                      key={index}
                      className={`w-2 h-2 rounded-full transition-all ${
                        index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                      }`}
                      onClick={() => setCurrentImageIndex(index)}
                    />
                  ))}
                </div>
              </div>
            </Card>

            {/* Thumbnail Gallery */}
            <div className="grid grid-cols-4 gap-2">
              {item.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                    index === currentImageIndex 
                      ? 'border-primary' 
                      : 'border-transparent hover:border-muted-foreground'
                  }`}
                >
                  <img
                    src={image}
                    alt={`Thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Item Details */}
          <div className="space-y-6">
            <div>
              <div className="flex items-start justify-between mb-2">
                <h1 className="text-3xl font-bold text-foreground">{item.title}</h1>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={handleSaveItem}
                    className={item.saved ? 'text-red-500' : ''}
                  >
                    <Heart className={`h-4 w-4 ${item.saved ? 'fill-current' : ''}`} />
                  </Button>
                  <Button variant="outline" size="icon">
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl font-bold text-primary">${item.price}</span>
                <Badge variant="secondary" className="font-medium">
                  {item.condition}
                </Badge>
                <Badge variant="outline">{item.category}</Badge>
              </div>
            </div>

            {/* Seller Info */}
            <Card>
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{item.seller.name}</CardTitle>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        <span>{item.seller.rating}</span>
                        <span>({item.seller.reviewCount} reviews)</span>
                      </div>
                    </div>
                  </div>
                  <MessageButton 
                    userId={item.sellerId} 
                    userName={item.seller.name}
                  />
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>{item.seller.university}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>Posted {getTimeAgo(item.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Shield className="w-4 h-4" />
                    <span>Verified Student</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">{item.description}</p>
              </CardContent>
            </Card>

            {/* Specifications */}
            {item.specifications && item.specifications.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Specifications</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {item.specifications.map((spec, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <span className="text-muted-foreground">{spec.label}</span>
                        <span className="font-medium">{spec.value}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Similar Items */}
        {similarItems.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6">Similar Items</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {similarItems.map((similarItem) => (
                <Card 
                  key={similarItem.id} 
                  className="group hover:shadow-[var(--shadow-card)] transition-all duration-300 hover:-translate-y-1 cursor-pointer"
                  onClick={() => handleSimilarItemClick(similarItem.id)}
                >
                  <div className="aspect-square bg-muted rounded-t-lg overflow-hidden">
                    <img 
                      src={similarItem.images[0] || "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=400&h=400"}
                      alt={similarItem.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg font-semibold line-clamp-2">{similarItem.title}</CardTitle>
                      <span className="text-lg font-bold text-primary">${similarItem.price}</span>
                    </div>
                    <CardDescription className="text-sm text-muted-foreground">
                      Condition: {similarItem.condition}
                    </CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const ItemDetail = () => {
  return (
    <MarketplaceProvider>
      <ItemDetailContent />
    </MarketplaceProvider>
  );
};

export default ItemDetail;