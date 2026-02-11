import { useState, useEffect, useRef } from 'react';
import { Job } from '@/types/job';
import { PhotoEntry, addPhoto, getPhotosByJob, deletePhoto, updatePhotoCaption, compressImage } from '@/lib/photoDb';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Camera, Trash2, X, Download, MessageSquare } from 'lucide-react';
import { genId } from '@/data/constants';
import { useToast } from '@/hooks/use-toast';

interface Props { job: Job; updateJob: (j: Job) => void; }

const CATEGORIES = [
  { key: 'before' as const, label: 'BEFORE', emoji: '📸', color: 'bg-destructive text-destructive-foreground' },
  { key: 'during' as const, label: 'DURING', emoji: '📸', color: 'bg-warning text-warning-foreground' },
  { key: 'after' as const, label: 'AFTER', emoji: '📸', color: 'bg-success text-success-foreground' },
];

export default function PhotosTab({ job }: Props) {
  const [photos, setPhotos] = useState<PhotoEntry[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoEntry | null>(null);
  const [editCaption, setEditCaption] = useState('');
  const [loading, setLoading] = useState(false);
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const { toast } = useToast();

  useEffect(() => {
    getPhotosByJob(job.id).then(setPhotos);
  }, [job.id]);

  const handleCapture = async (category: PhotoEntry['category'], files: FileList | null) => {
    if (!files || files.length === 0) return;
    setLoading(true);
    try {
      for (const file of Array.from(files)) {
        const dataUrl = await compressImage(file);
        const photo: PhotoEntry = {
          id: genId(),
          jobId: job.id,
          category,
          dataUrl,
          caption: '',
          timestamp: new Date().toISOString(),
        };
        await addPhoto(photo);
      }
      const updated = await getPhotosByJob(job.id);
      setPhotos(updated);
      toast({ title: '✓ Photo saved', description: `Added to ${category} gallery` });
    } catch {
      toast({ title: 'Error', description: 'Failed to save photo', variant: 'destructive' });
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    await deletePhoto(id);
    setPhotos(prev => prev.filter(p => p.id !== id));
    setSelectedPhoto(null);
    toast({ title: 'Photo deleted' });
  };

  const handleSaveCaption = async () => {
    if (!selectedPhoto) return;
    await updatePhotoCaption(selectedPhoto.id, editCaption);
    setPhotos(prev => prev.map(p => p.id === selectedPhoto.id ? { ...p, caption: editCaption } : p));
    setSelectedPhoto({ ...selectedPhoto, caption: editCaption });
    toast({ title: '✓ Caption saved' });
  };

  const handleExport = () => {
    photos.forEach((photo, i) => {
      const link = document.createElement('a');
      link.href = photo.dataUrl;
      link.download = `${job.clientName}-${photo.category}-${i + 1}.jpg`;
      link.click();
    });
    toast({ title: '✓ Photos exported', description: 'Check your downloads folder' });
  };

  return (
    <div className="p-4 space-y-4">
      {/* Category Buttons */}
      <div className="grid grid-cols-3 gap-2">
        {CATEGORIES.map(cat => {
          const count = photos.filter(p => p.category === cat.key).length;
          return (
            <div key={cat.key}>
              <input
                type="file"
                accept="image/*"
                capture="environment"
                multiple
                className="hidden"
                ref={el => { fileRefs.current[cat.key] = el; }}
                onChange={e => handleCapture(cat.key, e.target.files)}
              />
              <Button
                className={`w-full h-16 flex flex-col gap-0.5 text-xs ${cat.color}`}
                onClick={() => fileRefs.current[cat.key]?.click()}
                disabled={loading}
              >
                <span className="text-lg">{cat.emoji}</span>
                <span className="font-bold">{cat.label}</span>
                <span className="opacity-80">{count} photos</span>
              </Button>
            </div>
          );
        })}
      </div>

      {loading && (
        <div className="text-center p-4 text-sm text-muted-foreground animate-pulse">
          Saving photo...
        </div>
      )}

      {/* Photo Galleries by Category */}
      {CATEGORIES.map(cat => {
        const catPhotos = photos.filter(p => p.category === cat.key);
        if (catPhotos.length === 0) return null;
        return (
          <Card key={cat.key}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">{cat.emoji} {cat.label} ({catPhotos.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-2">
                {catPhotos.map(photo => (
                  <div
                    key={photo.id}
                    className="aspect-square rounded-lg overflow-hidden cursor-pointer relative group"
                    onClick={() => { setSelectedPhoto(photo); setEditCaption(photo.caption); }}
                  >
                    <img src={photo.dataUrl} alt={photo.caption || cat.label} className="w-full h-full object-cover" />
                    {photo.caption && (
                      <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[10px] px-1 py-0.5 truncate">
                        {photo.caption}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })}

      {/* Export Button */}
      {photos.length > 0 && (
        <Button variant="outline" className="w-full gap-2" onClick={handleExport}>
          <Download className="h-4 w-4" /> Export Gallery ({photos.length} photos)
        </Button>
      )}

      {photos.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            <Camera className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="font-semibold">No photos yet</p>
            <p className="text-xs mt-1">Tap a category button above to take photos</p>
          </CardContent>
        </Card>
      )}

      {/* Full Screen Photo Dialog */}
      <Dialog open={!!selectedPhoto} onOpenChange={open => !open && setSelectedPhoto(null)}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] p-2">
          <DialogHeader className="pb-1">
            <DialogTitle className="text-sm flex items-center justify-between">
              <span>{selectedPhoto?.category.toUpperCase()}</span>
              <span className="text-xs text-muted-foreground font-normal">
                {selectedPhoto && new Date(selectedPhoto.timestamp).toLocaleString()}
              </span>
            </DialogTitle>
          </DialogHeader>
          {selectedPhoto && (
            <div className="space-y-2">
              <img src={selectedPhoto.dataUrl} alt="" className="w-full rounded-lg max-h-[60vh] object-contain bg-black" />
              <div className="flex gap-2">
                <Input
                  placeholder="Add caption..."
                  value={editCaption}
                  onChange={e => setEditCaption(e.target.value)}
                  className="text-sm"
                />
                <Button size="sm" onClick={handleSaveCaption} className="shrink-0 gap-1">
                  <MessageSquare className="h-3.5 w-3.5" /> Save
                </Button>
              </div>
              <Button variant="destructive" size="sm" className="w-full gap-1" onClick={() => handleDelete(selectedPhoto.id)}>
                <Trash2 className="h-3.5 w-3.5" /> Delete Photo
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
