"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Upload, X, Plus, Save, Eye, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

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

  // --- HANDLER FUNCTIONS ---
  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (field === "name" && typeof value === "string") {
      const slug = value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
      setFormData((prev) => ({ ...prev, slug }))
    }
  }

  const addTag = (tag: string) => { if (!selectedTags.includes(tag)) setSelectedTags([...selectedTags, tag]) }
  const removeTag = (tag: string) => setSelectedTags(selectedTags.filter((t) => t !== tag))
  const addTech = (tech: string) => { if (!selectedTech.includes(tech)) setSelectedTech([...selectedTech, tech]) }
  const removeTech = (tech: string) => setSelectedTech(selectedTech.filter((t) => t !== tech))
  const addFeature = () => setFeatures([...features, ""])
  const updateFeature = (index: number, value: string) => { const newFeatures = [...features]; newFeatures[index] = value; setFeatures(newFeatures) }
  const removeFeature = (index: number) => setFeatures(features.filter((_, i) => i !== index))
  const addInclude = () => setIncludes([...includes, ""])
  const updateInclude = (index: number, value: string) => { const newIncludes = [...includes]; newIncludes[index] = value; setIncludes(newIncludes) }
  const removeInclude = (index: number) => setIncludes(includes.filter((_, i) => i !== index))
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => { if (e.target.files) setImages([...images, ...Array.from(e.target.files)]) }
  const removeImage = (index: number) => setImages(images.filter((_, i) => i !== index))

  /**
   * Uploads images to Cloudinary, then sends the resulting URLs and form data to the backend.
   */
  const handleSubmit = async (status: "draft" | "active") => {
    setIsLoading(true)

    // --- Cloudinary Upload Logic ---
    let uploadedImageUrls: string[] = [];
    try {
      // Create an array of upload promises
      const uploadPromises = images.map(async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        // IMPORTANT: Replace with your actual Cloudinary upload preset
        formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!); 

        const response = await fetch(
          `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!}/image/upload`,
          {
            method: 'POST',
            body: formData,
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`Cloudinary upload failed: ${errorData.error.message}`);
        }

        const data = await response.json();
        return data.secure_url; // The secure URL of the uploaded image
      });

      // Wait for all uploads to complete
      uploadedImageUrls = await Promise.all(uploadPromises);

    } catch (error) {
      console.error("Image upload failed:", error);
      alert(`Error uploading images: ${error instanceof Error ? error.message : String(error)}`);
      setIsLoading(false);
      return; // Stop submission if image upload fails
    }

    // --- Backend API Call ---
    const bundlePayload = {
      ...formData,
      price: parseFloat(formData.price) || 0,
      originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : undefined,
      difficulty: formData.difficulty.toUpperCase(),
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
      alert('Bundle created successfully!');
      // Optionally, redirect: window.location.href = '/admin/bundles';

    } catch (error) {
      console.error('Submission failed:', error);
      alert(`Error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsLoading(false);
    }
  }

  // --- JSX RENDER ---
  return (
    <div className="space-y-6 p-4 md:p-8">
      {/* Header Section */}
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
                      <Input id="name" value={formData.name} onChange={(e) => handleInputChange("name", e.target.value)} placeholder="Dashboard Pro" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="slug">URL Slug *</Label>
                      <Input id="slug" value={formData.slug} onChange={(e) => handleInputChange("slug", e.target.value)} placeholder="dashboard-pro" readOnly />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="shortDescription">Short Description *</Label>
                    <Input id="shortDescription" value={formData.shortDescription} onChange={(e) => handleInputChange("shortDescription", e.target.value)} placeholder="Complete admin dashboard solution" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Full Description *</Label>
                    <Textarea id="description" value={formData.description} onChange={(e) => handleInputChange("description", e.target.value)} placeholder="Detailed description of your bundle..." rows={6} />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="category">Category *</Label>
                      <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                        <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                        <SelectContent><SelectItem value="frontend">Frontend</SelectItem><SelectItem value="fullstack">Full-Stack</SelectItem><SelectItem value="backend">Backend</SelectItem><SelectItem value="mobile">Mobile</SelectItem></SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="difficulty">Difficulty *</Label>
                      <Select value={formData.difficulty} onValueChange={(value) => handleInputChange("difficulty", value)}>
                        <SelectTrigger><SelectValue placeholder="Select difficulty" /></SelectTrigger>
                        <SelectContent><SelectItem value="beginner">BEGINNER</SelectItem><SelectItem value="intermediate">INTERMEDIATE</SelectItem><SelectItem value="advanced">ADVANCED</SelectItem></SelectContent>
                      </Select>
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
                      <Input id="price" type="number" value={formData.price} onChange={(e) => handleInputChange("price", e.target.value)} placeholder="49" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="originalPrice">Original Price</Label>
                      <Input id="originalPrice" type="number" value={formData.originalPrice} onChange={(e) => handleInputChange("originalPrice", e.target.value)} placeholder="79" />
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
                <CardHeader><CardTitle>Tags</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {selectedTags.map((tag) => (<Badge key={tag} variant="secondary" className="flex items-center gap-1.5 py-1 px-2">{tag}<X className="h-3 w-3 cursor-pointer" onClick={() => removeTag(tag)} /></Badge>))}
                  </div>
                  <Select onValueChange={addTag}>
                    <SelectTrigger><SelectValue placeholder="Add tags..." /></SelectTrigger>
                    <SelectContent>{availableTags.filter((tag) => !selectedTags.includes(tag)).map((tag) => (<SelectItem key={tag} value={tag}>{tag}</SelectItem>))}</SelectContent>
                  </Select>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle>Technology Stack</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {selectedTech.map((tech) => (<Badge key={tech} variant="outline" className="flex items-center gap-1.5 py-1 px-2">{tech}<X className="h-3 w-3 cursor-pointer" onClick={() => removeTech(tech)} /></Badge>))}
                  </div>
                  <Select onValueChange={addTech}>
                    <SelectTrigger><SelectValue placeholder="Add technologies..." /></SelectTrigger>
                    <SelectContent>{availableTech.filter((tech) => !selectedTech.includes(tech)).map((tech) => (<SelectItem key={tech} value={tech}>{tech}</SelectItem>))}</SelectContent>
                  </Select>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle>Features</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  {features.map((feature, index) => (<div key={index} className="flex items-center gap-2"><Input value={feature} onChange={(e) => updateFeature(index, e.target.value)} placeholder="e.g., User authentication" /><Button variant="ghost" size="icon" onClick={() => removeFeature(index)} disabled={features.length === 1}><X className="h-4 w-4" /></Button></div>))}
                  <Button variant="outline" onClick={addFeature}><Plus className="h-4 w-4 mr-2" />Add Feature</Button>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle>What's Included</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  {includes.map((include, index) => (<div key={index} className="flex items-center gap-2"><Input value={include} onChange={(e) => updateInclude(index, e.target.value)} placeholder="e.g., Full source code" /><Button variant="ghost" size="icon" onClick={() => removeInclude(index)} disabled={includes.length === 1}><X className="h-4 w-4" /></Button></div>))}
                  <Button variant="outline" onClick={addInclude}><Plus className="h-4 w-4 mr-2" />Add Item</Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Media Tab */}
            <TabsContent value="media" className="space-y-6 pt-6">
              <Card>
                <CardHeader><CardTitle>Bundle Images</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <label htmlFor="image-upload" className="cursor-pointer border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center block hover:bg-muted/50 transition-colors">
                    <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-lg font-medium">Click to Upload Images</p>
                    <p className="text-sm text-muted-foreground">First image is the main preview. Drag and drop supported.</p>
                    <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" id="image-upload" />
                  </label>
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
                    <Input id="demoUrl" type="url" value={formData.demoUrl} onChange={(e) => handleInputChange("demoUrl", e.target.value)} placeholder="https://demo.example.com" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="githubUrl">GitHub URL</Label>
                    <Input id="githubUrl" type="url" value={formData.githubUrl} onChange={(e) => handleInputChange("githubUrl", e.target.value)} placeholder="https://github.com/username/repo" />
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
