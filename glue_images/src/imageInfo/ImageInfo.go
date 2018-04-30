package imageInfo

import (
	"strings"
	"strconv"
	"image"
	"os"
	"image/color"
)

// Create a struct to deal with pixel
type Pixel struct {
	Point image.Point
	Color color.Color
}

type ImageInfo struct {
	FileName string
	XLocation int
	YLocation int
	SP image.Point
	Rect image.Rectangle
	Img image.Image
	Pixels []*Pixel
}

type Pixels []*Pixel

//
func (img *ImageInfo) SetSP(imageSize int) (image.Point) {
	return image.Point{imageSize * img.XLocation, imageSize * img.YLocation}
}

func (img *ImageInfo) SetRect(point image.Point) (image.Rectangle) {
	return image.Rectangle{point, point.Add(image.Point{1280,1280})}
}

func (img *ImageInfo) SetXYLocation() (x int, y int) {
	const xCharIndex, yCharIndex uint8 = 1, 0
	positions := strings.Split(img.FileName, ".")[0]
	s := strings.Split(positions, "_")
	x, _ = strconv.Atoi(s[xCharIndex])
	y, _ = strconv.Atoi(s[yCharIndex])
	return
}

// Keep it DRY so don't have to repeat opening file and decode
func  (imgInfo *ImageInfo) OpenAndDecode(filepath string) (image.Image, string, error) {
	imgFile, err := os.Open(filepath)
	if err != nil {
		panic(err)
	}
	defer imgFile.Close()
	img, format, err := image.Decode(imgFile)
	if err != nil {
		panic(err)
	}
	return img, format, nil
}

// Decode image.Image's pixel data into []*Pixel
func (imgInfo *ImageInfo) DecodePixelsFromImage(offsetX, offsetY int) Pixels {
	pixels := Pixels{}
	for y := 0; y <= imgInfo.Img.Bounds().Max.Y; y++ {
		for x := 0; x <= imgInfo.Img.Bounds().Max.X; x++ {
			p := &Pixel{
				Point: image.Point{x + offsetX, y + offsetY},
				Color: imgInfo.Img.At(x, y),
			}
			pixels = append(pixels, p)
		}
	}
	return pixels
}

// Decode image.Image's pixel data into []*Pixel
func (imgInfo *ImageInfo) getPixels() []*Pixel {
	return imgInfo.Pixels
}