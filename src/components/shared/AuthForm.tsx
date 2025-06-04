"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AppLogo } from "./AppLogo";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useState } from "react";

type AuthFormType = "login" | "register";
type UserRole = "admin" | "faculty";

interface AuthFormProps {
  formType: AuthFormType;
  userRole: UserRole;
}

const getValidationSchema = (formType: AuthFormType) => {
  const schema = z.object({
    email: z.string().email({ message: "Invalid email address." }),
    password: z.string().min(6, { message: "Password must be at least 6 characters." }),
  });
  if (formType === "register") {
    return schema.extend({
      name: z.string().min(2, { message: "Name must be at least 2 characters." }),
    });
  }
  return schema;
};

export function AuthForm({ formType, userRole }: AuthFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // Use try-catch for useAuth to handle any context errors
  let authContext;
  try {
    authContext = useAuth();
  } catch (error) {
    console.error('Auth context error:', error);
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Authentication Error</h1>
          <p className="text-muted-foreground mb-4">There was an issue loading the authentication system.</p>
          <p className="text-sm text-muted-foreground">Please refresh the page or try again later.</p>
        </div>
      </div>
    );
  }

  const { login, register } = authContext;
  const validationSchema = getValidationSchema(formType);
  type ValidationSchemaType = z.infer<typeof validationSchema>;

  const form = useForm<ValidationSchemaType>({
    resolver: zodResolver(validationSchema),
    defaultValues: {
      email: "",
      password: "",
      ...(formType === "register" && { name: "" }),
    },
  });

  async function onSubmit(values: ValidationSchemaType) {
    setIsLoading(true);

    try {
      let success = false;

      if (formType === 'login') {
        success = await login(values.email, values.password);
      } else {
        // For register, we need to cast values to include name
        const registerValues = values as { name: string; email: string; password: string };
        success = await register(registerValues.name, registerValues.email, registerValues.password, userRole);
      }

      if (success) {
        // Redirect after successful auth
        if (userRole === 'admin') {
          router.push('/admin/dashboard');
        } else {
          router.push('/faculty/halls');
        }
      }
    } catch (error) {
      console.error('Auth error:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }

  const title = formType === "login" ? "Login" : "Register";
  const description = `Access your ${userRole} account.`;
  const buttonText = formType === "login" ? "Login" : "Create Account";
  const linkText = formType === "login" ? "Don't have an account?" : "Already have an account?";
  const linkHref = formType === "login" ? `/${userRole}/register` : `/${userRole}/login`;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto w-fit mb-4">
            <AppLogo />
          </div>
          <CardTitle className="font-headline">{title} to {userRole.charAt(0).toUpperCase() + userRole.slice(1)} Portal</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {formType === "register" && (
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Your Name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="your.email@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
                disabled={isLoading}
              >
                {isLoading ? 'Please wait...' : buttonText}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            {linkText}{' '}
            <Link href={linkHref} className="font-medium text-primary hover:underline">
              {formType === "login" ? "Register" : "Login"}
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
