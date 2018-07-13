package main

import (
	"fmt"
	_ "image/draw"
	"os"
	_ "image/png"
	"path/filepath"
	"io/ioutil"
	"imageInfo"
	"image"
	"image/draw"
	"image/png"
)

const IMAGE_SIZE  = 1280;


func DecodePixelsFromImage(img image.Image, offsetX, offsetY int) []*imageInfo.Pixel {
	pixels := []*imageInfo.Pixel{}
	for y := 0; y <= img.Bounds().Max.Y; y++ {
		for x := 0; x <= img.Bounds().Max.X; x++ {
			p := &imageInfo.Pixel{
				Point: image.Point{x + offsetX, y + offsetY},
				Color: img.At(x, y),
			}
			pixels = append(pixels, p)
		}
	}
	return pixels
}

func FilterFiles(files []os.FileInfo) (filteredFilesNames []string) {
	for _, f := range files {
		if filepath.Ext(f.Name()) == ".png" {
			filteredFilesNames = append(filteredFilesNames, f.Name())
		}
	}
	return
}



func main() {

	// get the path for images.
	// good enough for development
	pwd, err := os.Getwd()
	if err != nil {
		panic(err)
	}
	rootProjectDir := filepath.Dir(pwd)
	sourceImagesPath := rootProjectDir + "/results/image_matrix/"


	allFilesInDirectory, err := ioutil.ReadDir(sourceImagesPath)
	if err != nil {
		panic(err)
	}

	// filter unwanted OS files
	imageFilesNames := FilterFiles(allFilesInDirectory)

	list := imageInfo.ImageInfoList{}
	list.InitList(imageFilesNames, sourceImagesPath)

	//rectangle for the big image
	r := image.Rectangle{image.Point{0, 0}, image.Point{list.NumberOfXImages * IMAGE_SIZE, list.NumberOfYImages * IMAGE_SIZE}}
	rgba := image.NewRGBA(r)

	for i :=0; i < list.NumberOfImages ; i++ {
		fmt.Printf("drawing %v, %v\n", list.List[i].XLocation, list.List[i].YLocation)
		draw.Draw(rgba, list.List[i].Rect, list.List[i].Img, image.Point{0, 0}, draw.Src)
	}


	// Create a new file and write to it
	out, err := os.Create("./output.png")
	if err != nil {
		panic(err)
		os.Exit(1)
	}
	err = png.Encode(out, rgba)
	if err != nil {
		panic(err)
		os.Exit(1)
	}


}