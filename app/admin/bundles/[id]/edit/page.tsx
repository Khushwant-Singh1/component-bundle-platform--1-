"use client";

import type React from "react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Upload, X, Plus, Save, Eye, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import Image from "next/image";

interface Bundle {
  id: string;
  name: string;
  slug: string;
  shortDescription: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  difficulty: string;
  setupTime?: string;
  estimatedValue?: string;
  demoUrl?: string;
  githubUrl?: string;
  downloadUrl?: string;
  isActive: boolean;
  isFeatured: boolean;
  isBestseller: boolean;
  tags: string[];
  techStack: string[];
  features: string[];
  includes: string[];
  perfects: string[];
  benefits: string[];
  setup: { title: string; description: string }[];
  images: string[];
  createdAt: string;
  updatedAt: string;
  stats?: {
    reviewCount: number;
    salesCount: number;
    downloadCount: number;
  };
}

const availableTags = [
  "Next.js",
  "React",
  "TypeScript",
  "JavaScript",
  "Tailwind CSS",
  "CSS",
  "HTML",
  "Node.js",
  "Express",
  "MongoDB",
  "PostgreSQL",
  "MySQL",
  "Prisma",
  "Auth",
  "Dashboard",
  "E-commerce",
  "Blog",
  "Landing Page",
  "SaaS",
  "API",
  "Full-Stack",
  "Frontend",
  "Backend",
  "Mobile",
  "Responsive",
  "Dark Mode",
  "Charts",
  "Analytics",
];

const availableTech = [
  "Next.js 14",
  "React 18",
  "TypeScript",
  "Tailwind CSS",
  "Framer Motion",
  "Prisma",
  "NextAuth.js",
  "Stripe",
  "Recharts",
  "Radix UI",
  "shadcn/ui",
  "Node.js",
  "Express",
  "MongoDB",
  "PostgreSQL",
  "Redis",
  "WebSocket",
];

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function EditBundlePage({ params }: PageProps) {
  const router = useRouter();
  const [id, setId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [bundle, setBundle] = useState<Bundle | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Handle the Promise params in useEffect
  useEffect(() => {
    params.then((resolvedParams) => {
      setId(resolvedParams.id);
      fetchBundle(resolvedParams.id);
    });
  }, [params]);

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    shortDescription: "",
    description: "",
    price: 0,
    originalPrice: 0,
    category: "",
    difficulty: "",
    setupTime: "",
    estimatedValue: "",
    demoUrl: "",
    githubUrl: "",
    downloadUrl: "",
    isActive: true,
    isFeatured: false,
    isBestseller: false,
  });

  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedTech, setSelectedTech] = useState<string[]>([]);
  const [features, setFeatures] = useState<string[]>([""]);
  const [includes, setIncludes] = useState<string[]>([""]);
  const [perfects, setPerfects] = useState<string[]>([""]);
  const [benefits, setBenefits] = useState<string[]>([""]);
  const [setup, setSetup] = useState<{ title: string; description: string }[]>(
    []
  );
  const [images, setImages] = useState<string[]>([]);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [newZipFile, setNewZipFile] = useState<File | null>(null);
  const [currentZipFileName, setCurrentZipFileName] = useState<string>("");

  const fetchBundle = async (bundleId: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/bundles/${bundleId}`);

      if (!response.ok) {
        throw new Error("Failed to fetch bundle");
      }

      const result = await response.json();

      if (result.success && result.data) {
        const bundleData = result.data;
        setBundle(bundleData);

        // Populate form data
        setFormData({
          name: bundleData.name || "",
          slug: bundleData.slug || "",
          shortDescription: bundleData.shortDescription || "",
          description: bundleData.description || "",
          price: bundleData.price || 0,
          originalPrice: bundleData.originalPrice || 0,
          category: bundleData.category || "",
          difficulty: bundleData.difficulty?.toLowerCase() || "",
          setupTime: bundleData.setupTime || "",
          estimatedValue: bundleData.estimatedValue || "",
          demoUrl: bundleData.demoUrl || "",
          githubUrl: bundleData.githubUrl || "",
          downloadUrl: bundleData.downloadUrl || "",
          isActive: bundleData.isActive ?? true,
          isFeatured: bundleData.isFeatured ?? false,
          isBestseller: bundleData.isBestseller ?? false,
        });

        setSelectedTags(bundleData.tags || []);
        setSelectedTech(bundleData.techStack || []);
        setFeatures(
          bundleData.features?.length > 0 ? bundleData.features : [""]
        );
        setIncludes(
          bundleData.includes?.length > 0 ? bundleData.includes : [""]
        );
        setPerfects(
          bundleData.perfects?.length > 0 ? bundleData.perfects : [""]
        );
        setBenefits(
          bundleData.benefits?.length > 0 ? bundleData.benefits : [""]
        );
        setSetup(bundleData.setup || []);
        setImages(bundleData.images || []);

        // Extract ZIP file name from downloadUrl if it exists
        if (
          bundleData.downloadUrl &&
          bundleData.downloadUrl.startsWith("s3://")
        ) {
          const s3Key = bundleData.downloadUrl.replace("s3://", "");
          const fileName = s3Key.split("/").pop() || "bundle.zip";
          setCurrentZipFileName(fileName);
        } else if (bundleData.downloadUrl) {
          setCurrentZipFileName("bundle.zip");
        }
      } else {
        throw new Error(result.error?.message || "Failed to fetch bundle");
      }
    } catch (error) {
      console.error("Error fetching bundle:", error);
      toast({
        title: "Error",
        description: "Failed to load bundle data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (
    field: string,
    value: string | boolean | number
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }

    // Auto-generate slug from name
    if (field === "name" && typeof value === "string") {
      const slug = value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      setFormData((prev) => ({
        ...prev,
        slug,
      }));

      // Clear slug error too
      if (errors.slug) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors.slug;
          return newErrors;
        });
      }
    }
  };

  const addTag = (tag: string) => {
    if (!selectedTags.includes(tag)) {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const removeTag = (tag: string) => {
    setSelectedTags(selectedTags.filter((t: string) => t !== tag));
  };

  const addTech = (tech: string) => {
    if (!selectedTech.includes(tech)) {
      setSelectedTech([...selectedTech, tech]);
    }
  };

  const removeTech = (tech: string) => {
    setSelectedTech(selectedTech.filter((t: string) => t !== tech));
  };

  const addFeature = () => {
    setFeatures([...features, ""]);
  };

  const updateFeature = (index: number, value: string) => {
    const newFeatures = [...features];
    newFeatures[index] = value;
    setFeatures(newFeatures);
  };

  const removeFeature = (index: number) => {
    setFeatures(features.filter((_: string, i: number) => i !== index));
  };

  const addInclude = () => {
    setIncludes([...includes, ""]);
  };

  const updateInclude = (index: number, value: string) => {
    const newIncludes = [...includes];
    newIncludes[index] = value;
    setIncludes(newIncludes);
  };

  const removeInclude = (index: number) => {
    setIncludes(includes.filter((_: string, i: number) => i !== index));
  };
  const addPerfect = () => {
    setPerfects([...perfects, ""]);
  };

  const updatePerfect = (index: number, value: string) => {
    const newPerfects = [...perfects];
    newPerfects[index] = value;
    setPerfects(newPerfects);
  };

  const removePerfect = (index: number) => {
    setPerfects(perfects.filter((_: string, i: number) => i !== index));
  };
  const addBenefit = () => {
    setBenefits([...benefits, ""]);
  };
  const updateBenefit = (index: number, value: string) => {
    const newBenefits = [...benefits];
    newBenefits[index] = value;
    setBenefits(newBenefits);
  };
  const removeBenefit = (index: number) => {
    setBenefits(benefits.filter((_: string, i: number) => i !== index));
  };
  const addSetup = () => {
    setSetup([...setup, { title: "", description: "" }]);
  };
  const updateSetup = (
    index: number,
    field: "title" | "description",
    value: string
  ) => {
    const newSetup = [...setup];
    newSetup[index][field] = value;
    setSetup(newSetup);
  };
  const removeSetup = (index: number) => {
    setSetup(
      setup.filter(
        (_: { title: string; description: string }, i: number) => i !== index
      )
    );
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setNewImages([...newImages, ...files]);
    }
  };

  const removeExistingImage = (index: number) => {
    setImages(images.filter((_: string, i: number) => i !== index));
  };

  const removeNewImage = (index: number) => {
    setNewImages(newImages.filter((_: File, i: number) => i !== index));
  };

  const handleZipUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      // Validate file type
      if (!file.name.toLowerCase().endsWith(".zip")) {
        toast({
          title: "Invalid File Type",
          description: "Only ZIP files are allowed",
          variant: "destructive",
        });
        return;
      }

      setNewZipFile(file);

      // Clear any existing errors
      if (errors.zipFile) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors.zipFile;
          return newErrors;
        });
      }
    }
  };

  const removeNewZipFile = () => {
    setNewZipFile(null);
  };

  const uploadImageToCloudinary = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append(
      "upload_preset",
      process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "mypresent"
    );

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error("Failed to upload image");
      }

      const data = await response.json();
      return data.secure_url;
    } catch (error) {
      console.error("Error uploading image:", error);
      throw error;
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Bundle name is required";
    }

    if (!formData.slug.trim()) {
      newErrors.slug = "URL slug is required";
    } else if (!/^[a-z0-9-]+$/.test(formData.slug)) {
      newErrors.slug =
        "Slug must contain only lowercase letters, numbers, and hyphens";
    }

    if (!formData.shortDescription.trim()) {
      newErrors.shortDescription = "Short description is required";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }

    if (!formData.category) {
      newErrors.category = "Category is required";
    }

    if (!formData.difficulty) {
      newErrors.difficulty = "Difficulty is required";
    }

    if (formData.price <= 0) {
      newErrors.price = "Price must be greater than 0";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdate = async () => {
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors in the form",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSaving(true);

      // Upload new images to Cloudinary
      let uploadedImageUrls: string[] = [];
      if (newImages.length > 0) {
        toast({
          title: "Uploading images...",
          description: "Please wait while we upload your images",
        });

        uploadedImageUrls = await Promise.all(
          newImages.map((file) => uploadImageToCloudinary(file))
        );
      }

      // Upload new ZIP file to S3 if provided
      let newDownloadUrl = formData.downloadUrl;
      if (newZipFile) {
        toast({
          title: "Uploading ZIP file...",
          description: "Please wait while we upload your bundle file",
        });

        try {
          // Upload ZIP file via API route
          const uploadFormData = new FormData();
          uploadFormData.append("file", newZipFile);
          uploadFormData.append("bundleSlug", formData.slug);

          const uploadResponse = await fetch("/api/upload/bundle", {
            method: "POST",
            body: uploadFormData,
          });

          if (!uploadResponse.ok) {
            const errorData = await uploadResponse.json();
            throw new Error(errorData.error || "Failed to upload ZIP file");
          }

          const uploadResult = await uploadResponse.json();
          newDownloadUrl = `s3://${uploadResult.objectKey}`;
        } catch (error) {
          console.error("ZIP file upload failed:", error);
          toast({
            title: "Upload Error",
            description: `Failed to upload ZIP file: ${
              error instanceof Error ? error.message : "Unknown error"
            }`,
            variant: "destructive",
          });
          return;
        }
      }

      // Prepare bundle data for API
      const bundleData = {
        name: formData.name,
        slug: formData.slug,
        shortDescription: formData.shortDescription,
        description: formData.description,
        price: Number(formData.price),
        originalPrice: formData.originalPrice
          ? Number(formData.originalPrice)
          : undefined,
        category: formData.category,
        difficulty: formData.difficulty.toUpperCase(),
        setupTime: formData.setupTime || undefined,
        estimatedValue: formData.estimatedValue || undefined,
        demoUrl: formData.demoUrl || undefined,
        githubUrl: formData.githubUrl || undefined,
        downloadUrl: newDownloadUrl || undefined,
        isActive: formData.isActive,
        isFeatured: formData.isFeatured,
        isBestseller: formData.isBestseller,
        tags: selectedTags,
        techStack: selectedTech,
        features: features.filter((f: string) => f.trim() !== ""),
        includes: includes.filter((i: string) => i.trim() !== ""),
        perfects: perfects.filter((p: string) => p.trim() !== ""),
        benefits: benefits.filter((b: string) => b.trim() !== ""),
        setup: setup.filter(
          (s) => s.title.trim() !== "" && s.description.trim() !== ""
        ),
        images: [...images, ...uploadedImageUrls],
      };

      const response = await fetch(`/api/bundles/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bundleData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error?.message || "Failed to update bundle");
      }

      if (result.success) {
        toast({
          title: "Success",
          description: "Bundle updated successfully!",
        });

        // Clear new images since they're now saved
        setNewImages([]);
        setNewZipFile(null);

        // Refresh bundle data
        await fetchBundle(id);
      } else {
        throw new Error(result.error?.message || "Failed to update bundle");
      }
    } catch (error) {
      console.error("Error updating bundle:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to update bundle",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);

      const response = await fetch(`/api/bundles/${id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error?.message || "Failed to delete bundle");
      }

      if (result.success) {
        toast({
          title: "Success",
          description: "Bundle deleted successfully!",
        });
        router.push("/admin/bundles");
      } else {
        throw new Error(result.error?.message || "Failed to delete bundle");
      }
    } catch (error) {
      console.error("Error deleting bundle:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to delete bundle",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading bundle...</p>
        </div>
      </div>
    );
  }

  if (!bundle) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Bundle Not Found</h2>
          <p className="text-muted-foreground mb-4">
            The bundle you're looking for doesn't exist.
          </p>
          <Button asChild>
            <Link href="/admin/bundles">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Bundles
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" asChild>
            <Link href="/admin/bundles">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Bundles
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Edit Bundle</h1>
            <p className="text-muted-foreground">
              Update your bundle information and settings
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Bundle
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the
                  bundle and remove all associated data.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  disabled={isDeleting}
                >
                  {isDeleting ? "Deleting..." : "Delete Bundle"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <Button variant="outline" asChild>
            <Link href={`/bundles/${formData.slug}`}>
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Link>
          </Button>
          <Button onClick={handleUpdate} disabled={isSaving || isDeleting}>
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? "Updating..." : "Update Bundle"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="content">Content</TabsTrigger>
              <TabsTrigger value="media">Media</TabsTrigger>
              <TabsTrigger value="advanced">Advanced</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Bundle Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) =>
                          handleInputChange("name", e.target.value)
                        }
                        placeholder="Dashboard Pro"
                        className={errors.name ? "border-destructive" : ""}
                      />
                      {errors.name && (
                        <p className="text-sm text-destructive">
                          {errors.name}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="slug">URL Slug *</Label>
                      <Input
                        id="slug"
                        value={formData.slug}
                        onChange={(e) =>
                          handleInputChange("slug", e.target.value)
                        }
                        placeholder="dashboard-pro"
                        className={errors.slug ? "border-destructive" : ""}
                      />
                      {errors.slug && (
                        <p className="text-sm text-destructive">
                          {errors.slug}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="shortDescription">
                      Short Description *
                    </Label>
                    <Input
                      id="shortDescription"
                      value={formData.shortDescription}
                      onChange={(e) =>
                        handleInputChange("shortDescription", e.target.value)
                      }
                      placeholder="Complete admin dashboard solution with analytics and user management"
                      className={
                        errors.shortDescription ? "border-destructive" : ""
                      }
                    />
                    {errors.shortDescription && (
                      <p className="text-sm text-destructive">
                        {errors.shortDescription}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Full Description *</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) =>
                        handleInputChange("description", e.target.value)
                      }
                      placeholder="Detailed description of your bundle, its features, and benefits..."
                      rows={6}
                      className={errors.description ? "border-destructive" : ""}
                    />
                    {errors.description && (
                      <p className="text-sm text-destructive">
                        {errors.description}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="category">Category *</Label>
                      <Select
                        value={formData.category}
                        onValueChange={(value) =>
                          handleInputChange("category", value)
                        }
                      >
                        <SelectTrigger
                          className={
                            errors.category ? "border-destructive" : ""
                          }
                        >
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="frontend">Frontend</SelectItem>
                          <SelectItem value="fullstack">Full-Stack</SelectItem>
                          <SelectItem value="backend">Backend</SelectItem>
                          <SelectItem value="mobile">Mobile</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.category && (
                        <p className="text-sm text-destructive">
                          {errors.category}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="difficulty">Difficulty *</Label>
                      <Select
                        value={formData.difficulty}
                        onValueChange={(value) =>
                          handleInputChange("difficulty", value)
                        }
                      >
                        <SelectTrigger
                          className={
                            errors.difficulty ? "border-destructive" : ""
                          }
                        >
                          <SelectValue placeholder="Select difficulty" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="beginner">Beginner</SelectItem>
                          <SelectItem value="intermediate">
                            Intermediate
                          </SelectItem>
                          <SelectItem value="advanced">Advanced</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.difficulty && (
                        <p className="text-sm text-destructive">
                          {errors.difficulty}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="setupTime">Setup Time</Label>
                      <Input
                        id="setupTime"
                        value={formData.setupTime}
                        onChange={(e) =>
                          handleInputChange("setupTime", e.target.value)
                        }
                        placeholder="15 minutes"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Pricing</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="price">Current Price *</Label>
                      <Input
                        id="price"
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.price}
                        onChange={(e) =>
                          handleInputChange(
                            "price",
                            parseFloat(e.target.value) || 0
                          )
                        }
                        placeholder="49"
                        className={errors.price ? "border-destructive" : ""}
                      />
                      {errors.price && (
                        <p className="text-sm text-destructive">
                          {errors.price}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="originalPrice">Original Price</Label>
                      <Input
                        id="originalPrice"
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.originalPrice}
                        onChange={(e) =>
                          handleInputChange(
                            "originalPrice",
                            parseFloat(e.target.value) || 0
                          )
                        }
                        placeholder="79"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="estimatedValue">Estimated Value</Label>
                      <Input
                        id="estimatedValue"
                        value={formData.estimatedValue}
                        onChange={(e) =>
                          handleInputChange("estimatedValue", e.target.value)
                        }
                        placeholder="₹2,00,000+"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="content" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Tags</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {selectedTags.map((tag: string) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="flex items-center gap-1"
                      >
                        {tag}
                        <X
                          className="h-3 w-3 cursor-pointer"
                          onClick={() => removeTag(tag)}
                        />
                      </Badge>
                    ))}
                  </div>
                  <Select onValueChange={addTag}>
                    <SelectTrigger>
                      <SelectValue placeholder="Add tags..." />
                    </SelectTrigger>
                    <SelectContent>
                      {availableTags
                        .filter((tag) => !selectedTags.includes(tag))
                        .map((tag) => (
                          <SelectItem key={tag} value={tag}>
                            {tag}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Technology Stack</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {selectedTech.map((tech: string) => (
                      <Badge
                        key={tech}
                        variant="outline"
                        className="flex items-center gap-1"
                      >
                        {tech}
                        <X
                          className="h-3 w-3 cursor-pointer"
                          onClick={() => removeTech(tech)}
                        />
                      </Badge>
                    ))}
                  </div>
                  <Select onValueChange={addTech}>
                    <SelectTrigger>
                      <SelectValue placeholder="Add technologies..." />
                    </SelectTrigger>
                    <SelectContent>
                      {availableTech
                        .filter((tech) => !selectedTech.includes(tech))
                        .map((tech) => (
                          <SelectItem key={tech} value={tech}>
                            {tech}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Features</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {features.map((feature: string, index: number) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input
                        value={feature}
                        onChange={(e) => updateFeature(index, e.target.value)}
                        placeholder="Enter feature description..."
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeFeature(index)}
                        disabled={features.length === 1}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button variant="outline" onClick={addFeature}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Feature
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>What's Included</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {includes.map((include: string, index: number) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input
                        value={include}
                        onChange={(e) => updateInclude(index, e.target.value)}
                        placeholder="Enter what's included..."
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeInclude(index)}
                        disabled={includes.length === 1}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button variant="outline" onClick={addInclude}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Item
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Perfect For</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {perfects.map((item: string, index: number) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input
                        value={item}
                        onChange={(e) => updatePerfect(index, e.target.value)}
                        placeholder="Enter who this is perfect for..."
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removePerfect(index)}
                        disabled={perfects.length === 1}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button variant="outline" onClick={addPerfect}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Item
                  </Button>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Key Benefits</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {benefits.map((item: string, index: number) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input
                        value={item}
                        onChange={(e) => updateBenefit(index, e.target.value)}
                        placeholder="Enter a benefit..."
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeBenefit(index)}
                        disabled={benefits.length === 1}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button variant="outline" onClick={addBenefit}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Item
                  </Button>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Setup Instructions *</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {setup.map((setupItem, index) => (
                    <div
                      key={index}
                      className="space-y-2 p-4 border rounded-lg"
                    >
                      <div className="flex items-center gap-2">
                        <Input
                          value={setupItem.title}
                          onChange={(e) =>
                            updateSetup(index, "title", e.target.value)
                          }
                          placeholder="e.g., Install Dependencies"
                          className={errors.setup ? "border-destructive" : ""}
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeSetup(index)}
                          disabled={setup.length === 1}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      <Textarea
                        value={setupItem.description}
                        onChange={(e) =>
                          updateSetup(index, "description", e.target.value)
                        }
                        placeholder="e.g., Run npm install to install all required dependencies"
                        className={errors.setup ? "border-destructive" : ""}
                        rows={3}
                      />
                    </div>
                  ))}
                  <Button variant="outline" onClick={addSetup}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Setup Step
                  </Button>
                  {errors.setup && (
                    <p className="text-sm text-destructive">{errors.setup}</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="media" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Current Images</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {images.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {images.map((image: string, index: number) => (
                        <div key={index} className="relative group">
                          <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                            <Image width={300} height={200} src={image} alt={`Image ${index + 1}`} objectFit="cover" />
                          </div>
                          <Button
                            variant="destructive"
                            size="sm"
                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => removeExistingImage(index)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                          {index === 0 && (
                            <Badge className="absolute bottom-2 left-2">
                              Main Image
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Add New Images</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                    <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <div className="space-y-2">
                      <p className="text-lg font-medium">
                        Upload Additional Images
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Add more screenshots, previews, and demo images.
                      </p>
                    </div>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="image-upload"
                    />
                    <Button asChild className="mt-4">
                      <label htmlFor="image-upload" className="cursor-pointer">
                        Choose Images
                      </label>
                    </Button>
                  </div>

                  {newImages.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {newImages.map((image: File, index: number) => (
                        <div key={index} className="relative group">
                          <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                            <Image src={URL.createObjectURL(image)} alt={`New Image ${index + 1}`} width={300} height={200} objectFit="cover" />
                          </div>
                          <Button
                            variant="destructive"
                            size="sm"
                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => removeNewImage(index)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                          <Badge
                            variant="secondary"
                            className="absolute bottom-2 left-2"
                          >
                            New
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* ZIP File Management */}
              <Card>
                <CardHeader>
                  <CardTitle>Bundle ZIP File</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Current ZIP File Info */}
                  {currentZipFileName && (
                    <div className="bg-muted p-4 rounded-lg">
                      <h4 className="font-medium mb-2">Current Bundle File</h4>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <span className="text-blue-600 font-medium text-sm">
                            ZIP
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">{currentZipFileName}</p>
                          <p className="text-sm text-muted-foreground">
                            Currently active bundle file
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Upload New ZIP File */}
                  <div>
                    <h4 className="font-medium mb-3">
                      {currentZipFileName
                        ? "Replace Bundle File"
                        : "Upload Bundle File"}
                    </h4>
                    <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                      <Upload className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
                      <div className="space-y-2">
                        <p className="font-medium">
                          {currentZipFileName
                            ? "Upload New ZIP File"
                            : "Upload Bundle ZIP File"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {currentZipFileName
                            ? "Select a new ZIP file to replace the current bundle"
                            : "Upload the complete bundle source code as a ZIP file"}
                        </p>
                      </div>
                      <input
                        type="file"
                        accept=".zip"
                        onChange={handleZipUpload}
                        className="hidden"
                        id="zip-upload"
                      />
                      <Button asChild variant="outline" className="mt-3">
                        <label htmlFor="zip-upload" className="cursor-pointer">
                          Choose ZIP File
                        </label>
                      </Button>
                    </div>

                    {/* New ZIP File Preview */}
                    {newZipFile && (
                      <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                              <span className="text-green-600 font-medium text-sm">
                                ZIP
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-green-800">
                                {newZipFile.name}
                              </p>
                              <p className="text-sm text-green-600">
                                {(newZipFile.size / 1024 / 1024).toFixed(2)} MB
                                - Ready to upload on save
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={removeNewZipFile}
                            className="text-green-700 hover:text-green-900"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="advanced" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>URLs & Links</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="demoUrl">Demo URL</Label>
                    <Input
                      id="demoUrl"
                      value={formData.demoUrl}
                      onChange={(e) =>
                        handleInputChange("demoUrl", e.target.value)
                      }
                      placeholder="https://demo.example.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="githubUrl">GitHub URL</Label>
                    <Input
                      id="githubUrl"
                      value={formData.githubUrl}
                      onChange={(e) =>
                        handleInputChange("githubUrl", e.target.value)
                      }
                      placeholder="https://github.com/username/repo"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Bundle Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="isActive">Active</Label>
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) =>
                    handleInputChange("isActive", checked)
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="isFeatured">Featured</Label>
                <Switch
                  id="isFeatured"
                  checked={formData.isFeatured}
                  onCheckedChange={(checked) =>
                    handleInputChange("isFeatured", checked)
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="isBestseller">Bestseller</Label>
                <Switch
                  id="isBestseller"
                  checked={formData.isBestseller}
                  onCheckedChange={(checked) =>
                    handleInputChange("isBestseller", checked)
                  }
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Bundle Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">
                  Total Sales:
                </span>
                <span className="font-semibold">
                  {bundle.stats?.salesCount || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">
                  Downloads:
                </span>
                <span className="font-semibold">
                  {bundle.stats?.downloadCount || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Reviews:</span>
                <span className="font-semibold">
                  {bundle.stats?.reviewCount || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Created:</span>
                <span className="font-semibold">
                  {new Date(bundle.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">
                  Last Updated:
                </span>
                <span className="font-semibold">
                  {new Date(bundle.updatedAt).toLocaleDateString()}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                  {images.length > 0 ? (
                    <Image src={images[0]} alt="Bundle Preview" width={300} height={200} className="w-full h-full rounded-lg" objectFit="cover" />
                  ) : (
                    <span>No Preview Available</span>
                  )}
                </div>
                <div>
                  <h3 className="font-semibold">{formData.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {formData.shortDescription}
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold text-lg">₹{formData.price}</span>
                    {formData.originalPrice && formData.originalPrice > 0 && (
                      <span className="text-sm text-muted-foreground line-through ml-2">
                        ₹{formData.originalPrice}
                      </span>
                    )}
                  </div>
                  <Badge variant={formData.isActive ? "default" : "secondary"}>
                    {formData.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
