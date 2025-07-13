import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Star, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle,
  Heart,
  MessageSquare,
  Bell
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

// Mock CSAT data
const csatData = [
  { month: 'Jan', score: 4.2 },
  { month: 'Feb', score: 4.5 },
  { month: 'Mar', score: 4.1 },
  { month: 'Apr', score: 4.7 },
  { month: 'May', score: 4.6 },
  { month: 'Jun', score: 4.8 },
];

const satisfactionBreakdown = [
  { name: 'Very Satisfied', value: 45, color: '#22c55e' },
  { name: 'Satisfied', value: 30, color: '#3b82f6' },
  { name: 'Neutral', value: 15, color: '#f59e0b' },
  { name: 'Dissatisfied', value: 10, color: '#ef4444' },
];

const recentFeedback = [
  {
    id: 1,
    rating: 5,
    comment: "Excellent service! The tour guide was very knowledgeable.",
    customer: "John D.",
    destination: "Bangkok",
    date: "2 hours ago"
  },
  {
    id: 2,
    rating: 4,
    comment: "Good experience overall, but the hotel could be better.",
    customer: "Sarah M.",
    destination: "Phuket",
    date: "5 hours ago"
  },
  {
    id: 3,
    rating: 2,
    comment: "Transportation was delayed and caused issues with our itinerary.",
    customer: "Mike R.",
    destination: "Chiang Mai",
    date: "1 day ago"
  }
];

export function FeedbackInsights() {
  const averageRating = 4.6;
  const totalResponses = 1247;
  const responseRate = 68;

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <div className="space-y-4">
      {/* CSAT Overview */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Heart className="h-5 w-5 text-red-500" />
              Customer Satisfaction
            </CardTitle>
            <Badge variant="outline" className="text-green-600 border-green-500">
              <TrendingUp className="h-3 w-3 mr-1" />
              +0.2
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold">{averageRating}</span>
                <div className="flex">{renderStars(Math.floor(averageRating))}</div>
              </div>
              <p className="text-sm text-muted-foreground">
                Based on {totalResponses} responses
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Response Rate</p>
              <p className="text-lg font-semibold">{responseRate}%</p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Response Rate</span>
              <span>{responseRate}%</span>
            </div>
            <Progress value={responseRate} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Feedback Tabs */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Feedback Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="trends" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="trends">Trends</TabsTrigger>
              <TabsTrigger value="recent">Recent</TabsTrigger>
            </TabsList>
            
            <TabsContent value="trends" className="space-y-4">
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={csatData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis domain={[0, 5]} />
                    <Tooltip />
                    <Bar dataKey="score" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {satisfactionBreakdown.map((item) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-xs text-muted-foreground">
                      {item.name}: {item.value}%
                    </span>
                  </div>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="recent" className="space-y-3">
              {recentFeedback.map((feedback) => (
                <div key={feedback.id} className="border rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex">{renderStars(feedback.rating)}</div>
                      <span className="text-sm font-medium">{feedback.customer}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{feedback.date}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{feedback.comment}</p>
                  <Badge variant="outline" className="text-xs">
                    {feedback.destination}
                  </Badge>
                </div>
              ))}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Alternative Notifications */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Bell className="h-5 w-5 text-amber-500" />
            Alternative Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <span className="text-sm font-medium">Low Rating Alert</span>
            </div>
            <Badge variant="outline" className="border-amber-500 text-amber-600">
              2 new
            </Badge>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Ratings ≤ 2 stars</span>
              <Badge variant="destructive">3</Badge>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span>Negative keywords</span>
              <Badge variant="outline">1</Badge>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span>Refund requests</span>
              <Badge variant="secondary">2</Badge>
            </div>
          </div>

          <Button variant="outline" size="sm" className="w-full">
            <MessageSquare className="h-4 w-4 mr-2" />
            View All Alerts
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}