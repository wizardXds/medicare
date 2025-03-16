import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
import { Header } from "@/components/dashboard/header";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Button } from "@/components/ui/button";
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { UserCog, Lock, Bell, Shield, Info, Upload } from "lucide-react";
import { User } from "@shared/schema";

// Profile form schema
const profileFormSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  bio: z.string().optional(),
});

// Password form schema
const passwordFormSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^a-zA-Z0-9]/, "Password must contain at least one special character"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;
type PasswordFormValues = z.infer<typeof passwordFormSchema>;

export default function SettingsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Profile form
  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.email || "",
      phone: user?.phone || "",
      bio: user?.bio || "",
    },
  });
  
  // Password form
  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });
  
  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: Partial<User>) => {
      const res = await apiRequest("PATCH", `/api/users/${user?.id}`, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({
        title: "Profile Updated",
        description: "Your profile information has been successfully updated.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Update Failed",
        description: error.message || "Could not update profile information. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  // Change password mutation
  const changePasswordMutation = useMutation({
    mutationFn: async (data: { currentPassword: string; newPassword: string }) => {
      const res = await apiRequest("POST", `/api/users/${user?.id}/change-password`, data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Password Changed",
        description: "Your password has been successfully updated.",
      });
      passwordForm.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Password Change Failed",
        description: error.message || "Could not update password. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  function onProfileSubmit(data: ProfileFormValues) {
    updateProfileMutation.mutate(data);
  }
  
  function onPasswordSubmit(data: PasswordFormValues) {
    const { currentPassword, newPassword } = data;
    changePasswordMutation.mutate({ currentPassword, newPassword });
  }

  const getInitials = () => {
    if (!user) return "U";
    return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`;
  };

  return (
    <div className="min-h-screen bg-neutral-100 flex flex-col">
      <Header />
      
      <div className="flex-1 flex">
        <aside className="hidden md:block bg-white shadow-md w-64 flex-shrink-0">
          <Sidebar />
        </aside>

        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          <div className="mb-6">
            <h1 className="font-bold text-2xl text-neutral-700">Account Settings</h1>
            <p className="text-neutral-500">Manage your account preferences and information</p>
          </div>
          
          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="mb-2">
              <TabsTrigger value="profile" className="flex items-center gap-2">
                <UserCog className="h-4 w-4" />
                <span>Profile</span>
              </TabsTrigger>
              <TabsTrigger value="password" className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                <span>Password</span>
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                <span>Notifications</span>
              </TabsTrigger>
              <TabsTrigger value="privacy" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                <span>Privacy</span>
              </TabsTrigger>
            </TabsList>
            
            <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
              <div className="lg:col-span-1">
                <Card>
                  <CardHeader>
                    <CardTitle>Profile Picture</CardTitle>
                    <CardDescription>
                      Update your profile image
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col items-center text-center">
                    <Avatar className="h-32 w-32 mb-5">
                      <AvatarImage src="" alt={user?.firstName} />
                      <AvatarFallback className="text-2xl">{getInitials()}</AvatarFallback>
                    </Avatar>
                    
                    <div className="space-y-4 w-full">
                      <Button className="w-full flex items-center gap-2">
                        <Upload className="h-4 w-4" />
                        <span>Upload new image</span>
                      </Button>
                      <Button variant="outline" className="w-full">Remove</Button>
                    </div>
                    
                    <div className="mt-4 text-xs text-neutral-500">
                      <p>Recommended: Square image, at least 300x300px</p>
                      <p>Formats: JPG or PNG, max 5MB</p>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="mt-4">
                  <CardHeader>
                    <CardTitle>Account Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between items-center pb-2 border-b border-neutral-100">
                      <span className="text-sm text-neutral-500">Member Since</span>
                      <span className="font-medium">{new Date().toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between items-center pb-2 border-b border-neutral-100">
                      <span className="text-sm text-neutral-500">Account Type</span>
                      <span className="font-medium capitalize">{user?.role || "Patient"}</span>
                    </div>
                    <div className="flex justify-between items-center pb-2 border-b border-neutral-100">
                      <span className="text-sm text-neutral-500">Last Login</span>
                      <span className="font-medium">{new Date().toLocaleDateString()}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="lg:col-span-2">
                <TabsContent value="profile" className="mt-0">
                  <Card>
                    <CardHeader>
                      <CardTitle>Personal Information</CardTitle>
                      <CardDescription>
                        Update your personal details and public profile
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Form {...profileForm}>
                        <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={profileForm.control}
                              name="firstName"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>First Name</FormLabel>
                                  <FormControl>
                                    <Input {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={profileForm.control}
                              name="lastName"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Last Name</FormLabel>
                                  <FormControl>
                                    <Input {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          
                          <FormField
                            control={profileForm.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                  <Input {...field} type="email" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={profileForm.control}
                            name="phone"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Phone Number</FormLabel>
                                <FormControl>
                                  <Input {...field} type="tel" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          {user?.role === "doctor" && (
                            <FormField
                              control={profileForm.control}
                              name="bio"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Professional Bio</FormLabel>
                                  <FormControl>
                                    <Textarea
                                      {...field}
                                      placeholder="Tell patients about your experience, qualifications, and approach..."
                                      className="resize-none"
                                      rows={5}
                                    />
                                  </FormControl>
                                  <FormDescription>
                                    This information will be displayed on your public profile.
                                  </FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          )}
                          
                          <CardFooter className="px-0 pb-0">
                            <Button 
                              type="submit" 
                              disabled={updateProfileMutation.isPending}
                              className="flex gap-2"
                            >
                              {updateProfileMutation.isPending && (
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                              )}
                              <span>Save Changes</span>
                            </Button>
                          </CardFooter>
                        </form>
                      </Form>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="password" className="mt-0">
                  <Card>
                    <CardHeader>
                      <CardTitle>Change Password</CardTitle>
                      <CardDescription>
                        Update your password to maintain security
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Form {...passwordForm}>
                        <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-6">
                          <FormField
                            control={passwordForm.control}
                            name="currentPassword"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Current Password</FormLabel>
                                <FormControl>
                                  <Input {...field} type="password" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={passwordForm.control}
                            name="newPassword"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>New Password</FormLabel>
                                <FormControl>
                                  <Input {...field} type="password" />
                                </FormControl>
                                <FormDescription>
                                  Password must be at least 8 characters and include at least one number and one special character.
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={passwordForm.control}
                            name="confirmPassword"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Confirm New Password</FormLabel>
                                <FormControl>
                                  <Input {...field} type="password" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <CardFooter className="px-0 pb-0">
                            <Button 
                              type="submit" 
                              disabled={changePasswordMutation.isPending}
                              className="flex gap-2"
                            >
                              {changePasswordMutation.isPending && (
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                              )}
                              <span>Change Password</span>
                            </Button>
                          </CardFooter>
                        </form>
                      </Form>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="notifications" className="mt-0">
                  <Card>
                    <CardHeader>
                      <CardTitle>Notification Preferences</CardTitle>
                      <CardDescription>
                        Manage how you receive notifications
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        <div>
                          <h3 className="font-medium mb-4">Email Notifications</h3>
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <div className="space-y-0.5">
                                <label className="text-sm font-medium">Appointment Reminders</label>
                                <p className="text-xs text-neutral-500">
                                  Receive email reminders about upcoming appointments
                                </p>
                              </div>
                              <Switch defaultChecked />
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <div className="space-y-0.5">
                                <label className="text-sm font-medium">Prescription Renewals</label>
                                <p className="text-xs text-neutral-500">
                                  Get notified when your prescriptions need renewal
                                </p>
                              </div>
                              <Switch defaultChecked />
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <div className="space-y-0.5">
                                <label className="text-sm font-medium">Medical Updates</label>
                                <p className="text-xs text-neutral-500">
                                  Receive updates about your medical records and test results
                                </p>
                              </div>
                              <Switch defaultChecked />
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <div className="space-y-0.5">
                                <label className="text-sm font-medium">Marketing Communications</label>
                                <p className="text-xs text-neutral-500">
                                  Receive updates, newsletters, and promotional content
                                </p>
                              </div>
                              <Switch />
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <h3 className="font-medium mb-4">SMS Notifications</h3>
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <div className="space-y-0.5">
                                <label className="text-sm font-medium">Appointment Reminders</label>
                                <p className="text-xs text-neutral-500">
                                  Receive text reminders about upcoming appointments
                                </p>
                              </div>
                              <Switch defaultChecked />
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <div className="space-y-0.5">
                                <label className="text-sm font-medium">Medication Reminders</label>
                                <p className="text-xs text-neutral-500">
                                  Get SMS reminders to take your medication
                                </p>
                              </div>
                              <Switch defaultChecked />
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <CardFooter className="px-0 pb-0 mt-6">
                        <Button>Save Preferences</Button>
                      </CardFooter>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="privacy" className="mt-0">
                  <Card>
                    <CardHeader>
                      <CardTitle>Privacy Settings</CardTitle>
                      <CardDescription>
                        Manage your data and privacy preferences
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        <div>
                          <h3 className="font-medium mb-4">Data Sharing</h3>
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <div className="space-y-0.5">
                                <label className="text-sm font-medium">Share Medical Records with Doctors</label>
                                <p className="text-xs text-neutral-500">
                                  Allow your assigned doctors to view your medical history
                                </p>
                              </div>
                              <Switch defaultChecked />
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <div className="space-y-0.5">
                                <label className="text-sm font-medium">Research Participation</label>
                                <p className="text-xs text-neutral-500">
                                  Allow anonymized medical data to be used for research
                                </p>
                              </div>
                              <Switch />
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <h3 className="font-medium mb-4">Account Actions</h3>
                          <div className="space-y-4">
                            <div className="flex flex-col gap-2">
                              <Button variant="outline" className="flex items-center gap-2 justify-start">
                                <Info className="h-4 w-4" />
                                <span>Request copy of your data</span>
                              </Button>
                              <Button variant="outline" className="flex items-center gap-2 justify-start text-red-500 hover:text-red-600 hover:bg-red-50">
                                <Info className="h-4 w-4" />
                                <span>Delete account and data</span>
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <CardFooter className="px-0 pb-0 mt-6">
                        <Button>Save Privacy Settings</Button>
                      </CardFooter>
                    </CardContent>
                  </Card>
                </TabsContent>
              </div>
            </div>
          </Tabs>
        </main>
      </div>
    </div>
  );
}
