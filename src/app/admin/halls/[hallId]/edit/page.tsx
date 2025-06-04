
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
import { useRouter, useParams } from "next/navigation"; // useParams can be used directly
import { useEffect, useState } from "react";
import { Edit3 } from "lucide-react";
import { useHalls, type HallFormData } from '@/context/HallContext';
import { FileUpload } from '@/components/ui/file-upload';

const hallFormSchema = z.object({
  name: z.string().min(3, { message: "Hall name must be at least 3 characters." }),
  capacity: z.coerce.number().min(1, { message: "Capacity must be at least 1." }),
  equipment: z.array(z.string()).refine((value) => value.some((item) => item), {
    message: "You have to select at least one equipment item.",
  }),
});

type HallFormValues = z.infer<typeof hallFormSchema>;

// This list should ideally be sourced from a shared constants file
const availableEquipment = [
  { id: "projector", label: "Projector" },
  { id: "whiteboard", label: "Whiteboard" },
  { id: "sound_system", label: "Sound System" },
  { id: "microphone", label: "Microphone" },
  { id: "video_conference", label: "Video Conferencing" },
];
const equipmentLabelToIdMap = new Map(availableEquipment.map(item => [item.label, item.id]));


export default function EditHallPage() {
  const { toast } = useToast();
  const router = useRouter();
  const params = useParams();
  const hallId = params.hallId as string;
  const { getHallById, updateHall } = useHalls();
  const [hallDataToEdit, setHallDataToEdit] = useState<HallFormValues | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [currentImageUrl, setCurrentImageUrl] = useState<string>('');

  const form = useForm<HallFormValues>({
    resolver: zodResolver(hallFormSchema),
    defaultValues: {
      name: "",
      capacity: 50,
      equipment: [],
    },
  });
  
  useEffect(() => {
    if (hallId) {
      const hall = getHallById(hallId);
      if (hall) {
        // Convert equipment labels from context to IDs for the form
        const equipmentIds = hall.equipment.map(label => equipmentLabelToIdMap.get(label) || label);
        const formData = {
            name: hall.name,
            capacity: hall.capacity,
            equipment: equipmentIds,
        };
        setHallDataToEdit(formData);
        setCurrentImageUrl(hall.imageUrl || '');
        form.reset(formData);
      } else {
         toast({ title: "Error", description: "Hall not found.", variant: "destructive" });
         router.push("/admin/dashboard");
      }
      setIsLoading(false);
    }
  }, [hallId, getHallById, form, router, toast]);


  async function onSubmit(data: HallFormValues) {
    if (!hallId) return;

    let imageUrl = currentImageUrl; // Keep existing image if no new file

    // If a new file is selected, convert it to base64
    if (selectedFile) {
      try {
        const base64 = await convertFileToBase64(selectedFile);
        imageUrl = base64;
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to process image. Please try again.",
          variant: "destructive",
        });
        return;
      }
    }

    const hallDataForContext: HallFormData = {
        name: data.name,
        capacity: data.capacity,
        equipment: data.equipment, // these are IDs
        imageUrl: imageUrl,
    };

    const success = await updateHall(hallId, hallDataForContext);
    if (success) {
      toast({
        title: "Hall Updated!",
        description: `${data.name} has been successfully updated.`,
      });
      router.push("/admin/dashboard");
    }
  }

  // Helper function to convert file to base64
  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };
  
  if (isLoading) {
    return <PageTitle>Loading hall details...</PageTitle>;
  }

  if (!hallDataToEdit) {
    // This case should ideally be handled by the redirect in useEffect
    return <PageTitle>Hall not found</PageTitle>;
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
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Hall Image
                </label>
                <FileUpload
                  onFileSelect={setSelectedFile}
                  maxSize={5}
                  accept="image/*"
                  currentImageUrl={currentImageUrl}
                />
                <p className="text-sm text-muted-foreground">
                  Upload a new image to replace the current one (optional). Max size: 5MB.
                </p>
              </div>
              <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">Save Changes</Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

