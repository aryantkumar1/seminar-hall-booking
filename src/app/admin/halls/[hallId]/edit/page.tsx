"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { PageTitle } from '@/components/shared/PageTitle';
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Edit3 } from "lucide-react";

const hallFormSchema = z.object({
  name: z.string().min(3, { message: "Hall name must be at least 3 characters." }),
  capacity: z.coerce.number().min(1, { message: "Capacity must be at least 1." }),
  equipment: z.array(z.string()).refine((value) => value.some((item) => item), {
    message: "You have to select at least one equipment item.",
  }),
  imageUrl: z.string().url({ message: "Please enter a valid image URL." }).optional().or(z.literal('')),
});

type HallFormValues = z.infer<typeof hallFormSchema>;

const availableEquipment = [
  { id: "projector", label: "Projector" },
  { id: "whiteboard", label: "Whiteboard" },
  { id: "sound_system", label: "Sound System" },
  { id: "microphone", label: "Microphone" },
  { id: "video_conference", label: "Video Conferencing" },
];

// Mock hall data for editing
const mockHallData: HallFormValues & { id: string } = {
  id: '1',
  name: "Grand Auditorium",
  capacity: 200,
  equipment: ["projector", "sound_system"],
  imageUrl: "https://placehold.co/600x400.png",
};

export default function EditHallPage({ params }: { params: { hallId: string } }) {
  const { toast } = useToast();
  const router = useRouter();
  // In a real app, fetch hall data based on params.hallId
  const hallDataToEdit = mockHallData; // Assuming mockHallData matches params.hallId or is fetched

  const form = useForm<HallFormValues>({
    resolver: zodResolver(hallFormSchema),
    defaultValues: hallDataToEdit || { // Fallback if data isn't found, though UI should handle this
      name: "",
      capacity: 50,
      equipment: [],
      imageUrl: "",
    },
  });
  
  useEffect(() => {
    // Reset form with fetched data if params.hallId changes or on initial load
    // This is more relevant if hallDataToEdit was fetched asynchronously
    if (hallDataToEdit) {
      form.reset(hallDataToEdit);
    }
  }, [hallDataToEdit, form]);


  function onSubmit(data: HallFormValues) {
    console.log("Updated hall data:", { id: params.hallId, ...data });
    toast({
      title: "Hall Updated!",
      description: `${data.name} has been successfully updated.`,
    });
    router.push("/admin/dashboard");
  }
  
  if (!hallDataToEdit) {
    return <PageTitle>Hall not found</PageTitle>; // Or a more sophisticated loading/error state
  }

  return (
    <div className="max-w-2xl mx-auto">
      <PageTitle>Edit: {hallDataToEdit.name}</PageTitle>
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline flex items-center gap-2"><Edit3 className="text-primary"/>Hall Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hall Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="capacity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Capacity</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="equipment"
                render={() => (
                  <FormItem>
                    <div className="mb-4">
                      <FormLabel className="text-base">Equipment</FormLabel>
                      <FormDescription>
                        Update the equipment available in this hall.
                      </FormDescription>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                    {availableEquipment.map((item) => (
                      <FormField
                        key={item.id}
                        control={form.control}
                        name="equipment"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={item.id}
                              className="flex flex-row items-start space-x-3 space-y-0"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(item.id)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...(field.value || []), item.id])
                                      : field.onChange(
                                          (field.value || []).filter(
                                            (value) => value !== item.id
                                          )
                                        );
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal">
                                {item.label}
                              </FormLabel>
                            </FormItem>
                          );
                        }}
                      />
                    ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="imageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Image URL (Optional)</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                     <FormDescription>Update the URL for the hall's image.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">Save Changes</Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
