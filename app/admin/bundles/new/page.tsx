"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Upload, X, Plus, Save, Eye, Loader2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { bundleFormSchema } from "@/lib/validations/bundle"
import { uploadMultipleToCloudinary } from "@/lib/cloudinary"
import { z } from "zod"

// Mock data for available tags and technologies, assuming components are available
const availableTags = [ "Next.js", "React", "TypeScript", "JavaScript", "Tailwind CSS", "CSS", "HTML", "Node.js", "Express", "MongoDB", "PostgreSQL", "MySQL", "Prisma", "Auth", "Dashboard", "E-commerce", "Blog", "Landing Page", "SaaS", "API", "Full-Stack", "Frontend", "Backend", "Mobile", "Responsive", "Dark Mode", "Charts", "Analytics" ]
const availableTech = [ "Next.js 14", "React 18", "TypeScript", "Tailwind CSS", "Framer Motion", "Prisma", "NextAuth.js", "Stripe", "Recharts", "Radix UI", "shadcn/ui", "Node.js", "Express", "MongoDB", "PostgreSQL", "Redis", "WebSocket" ]

export default function NewBundlePage() {
  // --- STATE MANAGEMENT ---
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    shortDescription: "",
    description: "",
    price: "",
    originalPrice: "",
    category: "",
    difficulty: "",
    setupTime: "",
    estimatedValue: "",
    demoUrl: "",
    githubUrl: "",
    isActive: true,
    isFeatured: false,
    isBestseller: false,
  })

  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [selectedTech, setSelectedTech] = useState<string[]>([])
  const [features, setFeatures] = useState<string[]>([""])
  const [includes, setIncludes] = useState<string[]>([""])
  const [images, setImages] = useState<File[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [generalError, setGeneralError] = useState<string>("")
  const [successMessage, setSuccessMessage] = useState<string>("")

  // --- HANDLER FUNCTIONS ---
  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
    
    if (field === "name" && typeof value === "string") {
      const slug = value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
      setFormData((prev) => ({ ...prev, slug }))
      // Clear slug error too
      if (errors.slug) {
        setErrors((prev) => {
          const newErrors = { ...prev }
          delete newErrors.slug
          return newErrors
        })
      }
    }
  }

  // Validation function
  const validateForm = (): boolean => {
    setErrors({})
    setGeneralError("")

    // Prepare data for validation
    const formDataToValidate = {
      ...formData,
      tags: selectedTags,
      techStack: selectedTech,
      features: features.filter((f) => f.trim() !== ""),
      includes: includes.filter((i) => i.trim() !== ""),
    }

    try {
      bundleFormSchema.parse(formDataToValidate)
      
      // Additional validations
      if (images.length === 0) {
        setErrors((prev) => ({ ...prev, images: "At least one image is required" }))
        return false
      }

      if (formData.originalPrice && formData.price && Number(formData.originalPrice) <= Number(formData.price)) {
        setErrors((prev) => ({ ...prev, originalPrice: "Original price must be higher than current price" }))
        return false
      }

      return true
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {}
        error.errors.forEach((err) => {
          const path = err.path.join(".")
          fieldErrors[path] = err.message
        })
        setErrors(fieldErrors)
      }
      return false
    }
  }

  const addTag = (tag: string) => { 
    if (!selectedTags.includes(tag)) {
      setSelectedTags([...selectedTags, tag])
      // Clear tags error
      if (errors.tags) {
        setErrors((prev) => {
          const newErrors = { ...prev }
          delete newErrors.tags
          return newErrors
        })
      }
    }
  }
  const removeTag = (tag: string) => setSelectedTags(selectedTags.filter((t) => t !== tag))
  const addTech = (tech: string) => { 
    if (!selectedTech.includes(tech)) {
      setSelectedTech([...selectedTech, tech])
      // Clear techStack error
      if (errors.techStack) {
        setErrors((prev) => {
          const newErrors = { ...prev }
          delete newErrors.techStack
          return newErrors
        })
      }
    }
  }
  const removeTech = (tech: string) => setSelectedTech(selectedTech.filter((t) => t !== tech))
  const addFeature = () => setFeatures([...features, ""])
  const updateFeature = (index: number, value: string) => { 
    const newFeatures = [...features]; 
    newFeatures[index] = value; 
    setFeatures(newFeatures)
    // Clear features error
    if (errors.features) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors.features
        return newErrors
      })
    }
  }
  const removeFeature = (index: number) => setFeatures(features.filter((_, i) => i !== index))
  const addInclude = () => setIncludes([...includes, ""])
  const updateInclude = (index: number, value: string) => { 
    const newIncludes = [...includes]; 
    newIncludes[index] = value; 
    setIncludes(newIncludes)
    // Clear includes error
    if (errors.includes) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors.includes
        return newErrors
      })
    }
  }
  const removeInclude = (index: number) => setIncludes(includes.filter((_, i) => i !== index))
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => { 
    if (e.target.files) {
      setImages([...images, ...Array.from(e.target.files)])
      // Clear images error
      if (errors.images) {
        setErrors((prev) => {
          const newErrors = { ...prev }
          delete newErrors.images
          return newErrors
        })
      }
    }
  }
  const removeImage = (index: number) => setImages(images.filter((_, i) => i !== index))

  /**
   * Uploads images to Cloudinary, then sends the resulting URLs and form data to the backend.
   */
  const handleSubmit = async (status: "draft" | "active") => {
    // Validate form before submission
    if (!validateForm()) {
      setGeneralError("Please fix the errors above before submitting.")
      return
    }

    setIsLoading(true)
    setGeneralError("")

    // --- Cloudinary Upload Logic ---
    let uploadedImageUrls: string[] = [];
    
    try {
      uploadedImageUrls = await uploadMultipleToCloudinary(images);
    } catch (error) {
      console.error("Image upload failed:", error);
      setGeneralError(`Error uploading images: ${error instanceof Error ? error.message : String(error)}`);
      setIsLoading(false);
      return; // Stop submission if image upload fails
    }

    // --- Backend API Call ---
    const bundlePayload = {
      ...formData,
      price: parseFloat(formData.price) || 0,
      originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : undefined,
      difficulty: formData.difficulty ? formData.difficulty.toUpperCase() : "BEGINNER",
      tags: selectedTags,
      techStack: selectedTech,
      features: features.filter((f) => f.trim() !== ""),
      includes: includes.filter((i) => i.trim() !== ""),
      images: uploadedImageUrls, // Use the real URLs from Cloudinary
      isActive: status === 'active',
    };

    try {
      const response = await fetch('/api/bundles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bundlePayload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error.message || 'Failed to create the bundle.');
      }

      const result = await response.json();
      console.log('Successfully created bundle:', result.data);
      
      // Show success message and redirect
      setGeneralError("");
      setSuccessMessage("Bundle created successfully! Redirecting...");
      
      // Redirect after a short delay
      setTimeout(() => {
        window.location.href = '/admin/bundles';
      }, 2000);

    } catch (error) {
      console.error('Submission failed:', error);
      setGeneralError(`Error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsLoading(false);
    }
  }

  // --- JSX RENDER ---
  return (
    <div className="space-y-6 p-4 md:p-8">
      {/* Header Section */}
      {generalError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{generalError}</AlertDescription>
        </Alert>
      )}
      
      {successMessage && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{successMessage}</AlertDescription>
        </Alert>
      )}
      
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" asChild>
            <Link href="/admin/bundles">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Bundles
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Create New Bundle</h1>
            <p className="text-muted-foreground">Add a new component bundle to your marketplace</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => handleSubmit("draft")} disabled={isLoading}>
            {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            Save Draft
          </Button>
          <Button onClick={() => handleSubmit("active")} disabled={isLoading}>
            {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Eye className="h-4 w-4 mr-2" />}
            Publish Bundle
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Form */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="content">Content</TabsTrigger>
              <TabsTrigger value="media">Media</TabsTrigger>
              <TabsTrigger value="advanced">Advanced</TabsTrigger>
            </TabsList>

            {/* Basic Info Tab */}
            <TabsContent value="basic" className="space-y-6 pt-6">
              <Card>
                <CardHeader><CardTitle>Basic Information</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Bundle Name *</Label>
                      <Input 
                        id="name" 
                        value={formData.name} 
                        onChange={(e) => handleInputChange("name", e.target.value)} 
                        placeholder="Dashboard Pro"
                        className={errors.name ? "border-destructive" : ""}
                      />
                      {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="slug">URL Slug *</Label>
                      <Input 
                        id="slug" 
                        value={formData.slug} 
                        onChange={(e) => handleInputChange("slug", e.target.value)} 
                        placeholder="dashboard-pro"
                        className={errors.slug ? "border-destructive" : ""}
                      />
                      {errors.slug && <p className="text-sm text-destructive">{errors.slug}</p>}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="shortDescription">Short Description *</Label>
                    <Input 
                      id="shortDescription" 
                      value={formData.shortDescription} 
                      onChange={(e) => handleInputChange("shortDescription", e.target.value)} 
                      placeholder="Complete admin dashboard solution"
                      className={errors.shortDescription ? "border-destructive" : ""}
                    />
                    {errors.shortDescription && <p className="text-sm text-destructive">{errors.shortDescription}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Full Description *</Label>
                    <Textarea 
                      id="description" 
                      value={formData.description} 
                      onChange={(e) => handleInputChange("description", e.target.value)} 
                      placeholder="Detailed description of your bundle..." 
                      rows={6}
                      className={errors.description ? "border-destructive" : ""}
                    />
                    {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="category">Category *</Label>
                      <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                        <SelectTrigger className={errors.category ? "border-destructive" : ""}>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent><SelectItem value="frontend">Frontend</SelectItem><SelectItem value="fullstack">Full-Stack</SelectItem><SelectItem value="backend">Backend</SelectItem><SelectItem value="mobile">Mobile</SelectItem></SelectContent>
                      </Select>
                      {errors.category && <p className="text-sm text-destructive">{errors.category}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="difficulty">Difficulty *</Label>
                      <Select value={formData.difficulty} onValueChange={(value) => handleInputChange("difficulty", value)}>
                        <SelectTrigger className={errors.difficulty ? "border-destructive" : ""}>
                          <SelectValue placeholder="Select difficulty" />
                        </SelectTrigger>
                        <SelectContent><SelectItem value="BEGINNER">BEGINNER</SelectItem><SelectItem value="INTERMEDIATE">INTERMEDIATE</SelectItem><SelectItem value="ADVANCED">ADVANCED</SelectItem></SelectContent>
                      </Select>
                      {errors.difficulty && <p className="text-sm text-destructive">{errors.difficulty}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="setupTime">Setup Time</Label>
                      <Input id="setupTime" value={formData.setupTime} onChange={(e) => handleInputChange("setupTime", e.target.value)} placeholder="15 minutes" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle>Pricing</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="price">Current Price *</Label>
                      <Input 
                        id="price" 
                        type="number" 
                        value={formData.price} 
                        onChange={(e) => handleInputChange("price", e.target.value)} 
                        placeholder="49"
                        className={errors.price ? "border-destructive" : ""}
                      />
                      {errors.price && <p className="text-sm text-destructive">{errors.price}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="originalPrice">Original Price</Label>
                      <Input 
                        id="originalPrice" 
                        type="number" 
                        value={formData.originalPrice} 
                        onChange={(e) => handleInputChange("originalPrice", e.target.value)} 
                        placeholder="79"
                        className={errors.originalPrice ? "border-destructive" : ""}
                      />
                      {errors.originalPrice && <p className="text-sm text-destructive">{errors.originalPrice}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="estimatedValue">Estimated Value</Label>
                      <Input id="estimatedValue" value={formData.estimatedValue} onChange={(e) => handleInputChange("estimatedValue", e.target.value)} placeholder="$2,000+" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Content Tab */}
            <TabsContent value="content" className="space-y-6 pt-6">
              <Card>
                <CardHeader><CardTitle>Tags *</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {selectedTags.map((tag) => (<Badge key={tag} variant="secondary" className="flex items-center gap-1.5 py-1 px-2">{tag}<X className="h-3 w-3 cursor-pointer" onClick={() => removeTag(tag)} /></Badge>))}
                  </div>
                  <Select onValueChange={addTag}>
                    <SelectTrigger className={errors.tags ? "border-destructive" : ""}>
                      <SelectValue placeholder="Add tags..." />
                    </SelectTrigger>
                    <SelectContent>{availableTags.filter((tag) => !selectedTags.includes(tag)).map((tag) => (<SelectItem key={tag} value={tag}>{tag}</SelectItem>))}</SelectContent>
                  </Select>
                  {errors.tags && <p className="text-sm text-destructive">{errors.tags}</p>}
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle>Technology Stack *</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {selectedTech.map((tech) => (<Badge key={tech} variant="outline" className="flex items-center gap-1.5 py-1 px-2">{tech}<X className="h-3 w-3 cursor-pointer" onClick={() => removeTech(tech)} /></Badge>))}
                  </div>
                  <Select onValueChange={addTech}>
                    <SelectTrigger className={errors.techStack ? "border-destructive" : ""}>
                      <SelectValue placeholder="Add technologies..." />
                    </SelectTrigger>
                    <SelectContent>{availableTech.filter((tech) => !selectedTech.includes(tech)).map((tech) => (<SelectItem key={tech} value={tech}>{tech}</SelectItem>))}</SelectContent>
                  </Select>
                  {errors.techStack && <p className="text-sm text-destructive">{errors.techStack}</p>}
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle>Features *</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  {features.map((feature, index) => (<div key={index} className="flex items-center gap-2"><Input value={feature} onChange={(e) => updateFeature(index, e.target.value)} placeholder="e.g., User authentication" className={errors.features ? "border-destructive" : ""} /><Button variant="ghost" size="icon" onClick={() => removeFeature(index)} disabled={features.length === 1}><X className="h-4 w-4" /></Button></div>))}
                  <Button variant="outline" onClick={addFeature}><Plus className="h-4 w-4 mr-2" />Add Feature</Button>
                  {errors.features && <p className="text-sm text-destructive">{errors.features}</p>}
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle>What's Included *</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  {includes.map((include, index) => (<div key={index} className="flex items-center gap-2"><Input value={include} onChange={(e) => updateInclude(index, e.target.value)} placeholder="e.g., Full source code" className={errors.includes ? "border-destructive" : ""} /><Button variant="ghost" size="icon" onClick={() => removeInclude(index)} disabled={includes.length === 1}><X className="h-4 w-4" /></Button></div>))}
                  <Button variant="outline" onClick={addInclude}><Plus className="h-4 w-4 mr-2" />Add Item</Button>
                  {errors.includes && <p className="text-sm text-destructive">{errors.includes}</p>}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Media Tab */}
            <TabsContent value="media" className="space-y-6 pt-6">
              <Card>
                <CardHeader><CardTitle>Bundle Images *</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <label htmlFor="image-upload" className={`cursor-pointer border-2 border-dashed rounded-lg p-8 text-center block hover:bg-muted/50 transition-colors ${errors.images ? "border-destructive" : "border-muted-foreground/25"}`}>
                    <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-lg font-medium">Click to Upload Images</p>
                    <p className="text-sm text-muted-foreground">First image is the main preview. Drag and drop supported.</p>
                    <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" id="image-upload" />
                  </label>
                  {errors.images && <p className="text-sm text-destructive">{errors.images}</p>}
                  {images.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {images.map((image, index) => (
                        <div key={index} className="relative group aspect-video">
                          <img src={URL.createObjectURL(image)} alt={image.name} className="w-full h-full object-cover rounded-lg" onLoad={e => URL.revokeObjectURL(e.currentTarget.src)} />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                            <Button variant="destructive" size="icon" className="h-8 w-8" onClick={() => removeImage(index)}><X className="h-4 w-4" /></Button>
                          </div>
                          {index === 0 && <Badge className="absolute bottom-2 left-2">Cover</Badge>}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Advanced Tab */}
            <TabsContent value="advanced" className="space-y-6 pt-6">
              <Card>
                <CardHeader><CardTitle>URLs & Links</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="demoUrl">Demo URL</Label>
                    <Input 
                      id="demoUrl" 
                      type="url" 
                      value={formData.demoUrl} 
                      onChange={(e) => handleInputChange("demoUrl", e.target.value)} 
                      placeholder="https://demo.example.com"
                      className={errors.demoUrl ? "border-destructive" : ""}
                    />
                    {errors.demoUrl && <p className="text-sm text-destructive">{errors.demoUrl}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="githubUrl">GitHub URL</Label>
                    <Input 
                      id="githubUrl" 
                      type="url" 
                      value={formData.githubUrl} 
                      onChange={(e) => handleInputChange("githubUrl", e.target.value)} 
                      placeholder="https://github.com/username/repo"
                      className={errors.githubUrl ? "border-destructive" : ""}
                    />
                    {errors.githubUrl && <p className="text-sm text-destructive">{errors.githubUrl}</p>}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6 lg:sticky top-8">
          <Card>
            <CardHeader><CardTitle>Status & Visibility</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between"><Label htmlFor="isFeatured" className="font-normal">Featured on homepage</Label><Switch id="isFeatured" checked={formData.isFeatured} onCheckedChange={(checked) => handleInputChange("isFeatured", checked)} /></div>
              <div className="flex items-center justify-between"><Label htmlFor="isBestseller" className="font-normal">Mark as bestseller</Label><Switch id="isBestseller" checked={formData.isBestseller} onCheckedChange={(checked) => handleInputChange("isBestseller", checked)} /></div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Live Preview</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="aspect-video bg-muted rounded-lg flex items-center justify-center overflow-hidden">
                  {images.length > 0 ? (
                    <img src={URL.createObjectURL(images[0])} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-sm text-muted-foreground">Upload an Image</span>
                  )}
                </div>
                <div>
                  <h3 className="font-semibold truncate">{formData.name || "Bundle Name"}</h3>
                  <p className="text-sm text-muted-foreground truncate">{formData.shortDescription || "Short description appears here"}</p>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    {formData.price && <span className="font-bold text-lg">${formData.price}</span>}
                    {formData.originalPrice && (<span className="text-sm text-muted-foreground line-through ml-2">${formData.originalPrice}</span>)}
                  </div>
                  <Badge variant={formData.isActive ? "default" : "secondary"}>{isLoading ? "Saving..." : (formData.isActive ? "Active" : "Draft")}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
