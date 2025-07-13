
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Search, Filter, User, Star, Heart, Loader2 } from "lucide-react";
import Header from "@/components/Header";
import { MessageButton } from "@/components/MessageButton";
import { SellItemModal } from "@/components/SellItemModal";
import { useMarketplace } from "@/contexts/MarketplaceContext";
import { MarketplaceProvider } from "@/contexts/MarketplaceContext";

const MarketplaceContent = () => {
  const navigate = useNavigate();
  const [sellModalOpen, setSellModalOpen] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  
  const {
    items,
    loading,
    error,
    hasMore,
    searchQuery,
    loadItems,
    searchItems,
    saveItem,
    markAsViewed
  } = useMarketplace();

  useEffect(() => {
    loadItems(true);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchInput.trim();
    if (query) {
      searchItems(query, true);
    } else {
      loadItems(true);
    }
  };

  const handleItemClick = async (itemId: string) => {
    await markAsViewed(itemId);
    navigate(`/marketplace/item/${itemId}`);
  };

  const handleSaveItem = async (e: React.MouseEvent, itemId: string) => {
    e.stopPropagation();
    await saveItem(itemId);
  };

  const loadMoreItems = () => {
    if (searchQuery) {
      searchItems(searchQuery, false);
    } else {
      loadItems(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-3xl lg:text-4xl font-bold text-foreground">
              Student <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Marketplace</span>
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Buy and sell items within your trusted student community. From textbooks to tech, find everything you need for university life.
            </p>
          </div>

          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <input 
                type="text" 
                placeholder="Search for textbooks, electronics, furniture..."
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
            </div>
            <Button type="button" variant="outline" size="lg">
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
            <Button type="button" variant="hero" size="lg" onClick={() => setSellModalOpen(true)}>
              <ShoppingBag className="w-4 h-4 mr-2" />
              Sell Item
            </Button>
          </form>

          {error && (
            <div className="text-center py-8">
              <p className="text-destructive mb-4">{error}</p>
              <Button onClick={() => loadItems(true)} variant="outline">
                Retry
              </Button>
            </div>
          )}

          {!error && (
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {items.map((item) => (
                  <Card 
                    key={item.id} 
                    className="group hover:shadow-[var(--shadow-card)] transition-all duration-300 hover:-translate-y-1 cursor-pointer" 
                    onClick={() => handleItemClick(item.id)}
                  >
                    <div className="aspect-square bg-muted rounded-t-lg overflow-hidden relative">
                      <img 
                        src={item.images[0] || `https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=400&h=400`}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        className={`absolute top-2 right-2 h-8 w-8 bg-background/80 backdrop-blur-sm ${
                          item.saved ? 'text-red-500' : 'text-muted-foreground'
                        }`}
                        onClick={(e) => handleSaveItem(e, item.id)}
                      >
                        <Heart className={`h-4 w-4 ${item.saved ? 'fill-current' : ''}`} />
                      </Button>
                    </div>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg font-semibold line-clamp-2">{item.title}</CardTitle>
                        <span className="text-lg font-bold text-primary">${item.price}</span>
                      </div>
                      <CardDescription className="text-sm text-muted-foreground">
                        Condition: {item.condition}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{item.description}</p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                            <User className="w-3 h-3 text-white" />
                          </div>
                          <div>
                            <p className="text-xs font-medium">{item.seller.name}</p>
                            <div className="flex items-center gap-1">
                              <Star className="w-3 h-3 text-yellow-500 fill-current" />
                              <span className="text-xs text-muted-foreground">{item.seller.rating}</span>
                            </div>
                          </div>
                        </div>
                        <MessageButton 
                          userId={item.sellerId} 
                          userName={item.seller.name}
                          size="sm"
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {loading && (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                </div>
              )}

              {!loading && items.length === 0 && (
                <div className="text-center py-12">
                  <ShoppingBag className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No items found</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchQuery ? 'Try adjusting your search terms.' : 'Be the first to list an item!'}
                  </p>
                  {searchQuery && (
                    <Button onClick={() => loadItems(true)} variant="outline">
                      Show all items
                    </Button>
                  )}
                </div>
              )}

              {hasMore && !loading && items.length > 0 && (
                <div className="text-center py-6">
                  <Button onClick={loadMoreItems} variant="outline">
                    Load More Items
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      
      <SellItemModal open={sellModalOpen} onOpenChange={setSellModalOpen} />
    </div>
  );
};

const Marketplace = () => {
  return (
    <MarketplaceProvider>
      <MarketplaceContent />
    </MarketplaceProvider>
  );
};

export default Marketplace;
