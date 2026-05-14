"use client"

interface ImageViewerProps {
  imageUrl?: string
}

export function ImageViewer({ imageUrl }: ImageViewerProps) {
  return (
    <div className="flex h-full items-center justify-center bg-muted p-4">
      {imageUrl ? (
        <img src={imageUrl || "/placeholder.svg"} alt="Visualização" className="max-h-full max-w-full object-contain" />
      ) : (
        <p className="text-muted-foreground">Nenhuma imagem para exibir</p>
      )}
    </div>
  )
}
