import { useState } from "react";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

interface EvaluationFormProps {
  eventId: string;
  participantId: string;
  onClose: () => void;
}

export function EvaluationForm({ eventId, participantId, onClose }: EvaluationFormProps) {
  const { submitEvaluation } = useStore();
  const { toast } = useToast();
  const [rating, setRating] = useState("5");
  const [comments, setComments] = useState("");
  const [instructorRating, setInstructorRating] = useState("5");
  
  const handleSubmit = () => {
    submitEvaluation(eventId, participantId, {
      rating,
      instructorRating,
      comments,
      submittedAt: new Date().toISOString()
    });
    
    toast({
      title: "Evaluation Submitted",
      description: "Thank you for your feedback! Your certificate is now ready.",
    });
    onClose();
  };

  return (
    <Card className="w-full border-0 shadow-none">
      <CardHeader>
        <CardTitle>Event Evaluation</CardTitle>
        <CardDescription>Please provide your feedback to unlock your certificate.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <Label>Overall Event Rating</Label>
          <RadioGroup defaultValue="5" className="flex gap-4" onValueChange={setRating}>
            {[1, 2, 3, 4, 5].map((val) => (
              <div key={val} className="flex flex-col items-center gap-1">
                <RadioGroupItem value={val.toString()} id={`rating-${val}`} className="peer sr-only" />
                <Label 
                  htmlFor={`rating-${val}`}
                  className={`cursor-pointer p-2 rounded-full hover:bg-slate-100 peer-data-[state=checked]:bg-primary/10 peer-data-[state=checked]:text-primary transition-all`}
                >
                  <Star className={`h-6 w-6 ${val <= parseInt(rating) ? "fill-current text-yellow-400" : "text-slate-300"}`} />
                </Label>
                <span className="text-xs text-muted-foreground">{val}</span>
              </div>
            ))}
          </RadioGroup>
        </div>

        <div className="space-y-3">
          <Label>Instructor / Speaker Rating</Label>
          <RadioGroup defaultValue="5" className="flex gap-4" onValueChange={setInstructorRating}>
            {[1, 2, 3, 4, 5].map((val) => (
              <div key={val} className="flex flex-col items-center gap-1">
                <RadioGroupItem value={val.toString()} id={`inst-${val}`} className="peer sr-only" />
                <Label 
                  htmlFor={`inst-${val}`}
                  className={`cursor-pointer p-2 rounded-full hover:bg-slate-100 peer-data-[state=checked]:bg-primary/10 peer-data-[state=checked]:text-primary transition-all`}
                >
                  <Star className={`h-6 w-6 ${val <= parseInt(instructorRating) ? "fill-current text-yellow-400" : "text-slate-300"}`} />
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        <div className="space-y-2">
          <Label htmlFor="comments">Comments & Suggestions</Label>
          <Textarea 
            id="comments" 
            placeholder="What did you like? What can be improved?" 
            value={comments}
            onChange={(e) => setComments(e.target.value)}
          />
        </div>
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit}>Submit Evaluation</Button>
      </CardFooter>
    </Card>
  );
}
