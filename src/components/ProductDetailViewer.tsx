
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useProductDetails } from "@/hooks/useServiceDetails";
import { RiskLevelBadge } from "@/components/RiskLevelBadge";

const ProductDetailViewer = ({ productName = "Minuet" }) => {
  const { findProductByName, getProductRiskAssessments } = useProductDetails();
  const [product, setProduct] = useState<any>(null);
  const [assessments, setAssessments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const foundProduct = findProductByName(productName);
        
        if (!foundProduct) {
          setError(`Product "${productName}" not found in the database`);
          setLoading(false);
          return;
        }
        
        setProduct(foundProduct);
        
        const riskAssessments = await getProductRiskAssessments(foundProduct.id);
        setAssessments(riskAssessments);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching product data:", err);
        setError("Failed to fetch product data");
        setLoading(false);
      }
    };
    
    fetchData();
  }, [productName, findProductByName, getProductRiskAssessments]);

  if (loading) return <div className="flex justify-center p-8">Loading product details...</div>;
  if (error) return <div className="text-red-500 p-8">{error}</div>;
  if (!product) return <div className="p-8">No product found with name: {productName}</div>;

  return (
    <div className="container mx-auto py-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Product Details: {product.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p><strong>ID:</strong> {product.id}</p>
            <p><strong>Description:</strong> {product.description || "No description"}</p>
            <p><strong>Division:</strong> {product.division}</p>
            <p><strong>Team:</strong> {product.team}</p>
            <p><strong>Created At:</strong> {new Date(product.createdAt).toLocaleString()}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Risk Assessments ({assessments.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {assessments.length === 0 ? (
            <p>No risk assessments found for this product</p>
          ) : (
            <div className="space-y-4">
              {assessments.map((assessment) => (
                <Card key={assessment.id} className="border border-gray-200">
                  <CardContent className="p-4">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <p><strong>Risk Category:</strong> {assessment.risk_category}</p>
                        <p><strong>Risk Description:</strong> {assessment.risk_description}</p>
                        <p><strong>Risk Level:</strong> <RiskLevelBadge level={assessment.risk_level} /></p>
                        <p><strong>Data Classification:</strong> {assessment.data_classification}</p>
                        <p><strong>Risk Owner:</strong> {assessment.risk_owner}</p>
                      </div>
                      <div>
                        <p><strong>Mitigation:</strong> {assessment.mitigation}</p>
                        <p><strong>Data Interface:</strong> {assessment.data_interface}</p>
                        <p><strong>Data Location:</strong> {assessment.data_location}</p>
                        <p><strong>Likelihood (% per year):</strong> {assessment.likelihood_per_year}</p>
                        <p><strong>Mitigative Controls:</strong> {assessment.mitigative_controls_implemented || "Not specified"}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductDetailViewer;
