
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
import { PlusCircle } from "lucide-react";
import { useHalls, type HallFormData } from '@/context/HallContext';
import { FileUpload } from '@/components/ui/file-upload';
import { useState } from 'react';

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

export default function CreateHallPage() {
  const { toast } = useToast();
  const router = useRouter();
  const { addHall } = useHalls();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const form = useForm<HallFormValues>({
    resolver: zodResolver(hallFormSchema),
    defaultValues: {
      name: "",
      capacity: 50,
      equipment: [],
    },
  });

  async function onSubmit(data: HallFormValues) {
    let imageUrl = '';

    // If a file is selected, convert it to base64 for storage
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

    const success = await addHall(hallDataForContext);
    if (success) {
      toast({
        title: "Hall Created!",
        description: `${data.name} has been successfully created.`,
        className: "bg-primary text-primary-foreground",
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

  return (
    <div className="max-w-2xl mx-auto">
      <PageTitle>Create New Seminar Hall</PageTitle>
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline flex items-center gap-2"><PlusCircle className="text-primary" />Hall Details</CardTitle>
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
                      <Input placeholder="e.g., Main Auditorium" {...field} />
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
                      <Input type="number" placeholder="e.g., 100" {...field} />
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
                        Select the equipment available in this hall.
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
                />
                <p className="text-sm text-muted-foreground">
                  Upload an image of the hall (optional). Max size: 5MB.
                </p>
              </div>
              <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">Create Hall</Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
