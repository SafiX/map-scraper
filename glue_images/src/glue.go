package main

import (
	"fmt"
	//"image"
	_ "image/draw"
	"os"
	_ "image/png"
	//"image/color"
	"path/filepath"
	//"image/draw"
	//"image/png"
	"io/ioutil"
	//"log"
	//"strconv"
	//"strconv"
	//"strings"
	//"./imageInfo"
	"imageInfo"
	//"reflect"
//	"image"
	//"image/draw"
//	"image/draw"
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

	imageFilesNames := FilterFiles(allFilesInDirectory)

	for _, f := range imageFilesNames {
		fmt.Println(f)
	}

	list := imageInfo.ImageInfoList{}
	list.InitList(imageFilesNames, sourceImagesPath)



	//rectangle for the big image
	r := image.Rectangle{image.Point{0, 0}, image.Point{list.NumberOfXImages * IMAGE_SIZE, list.NumberOfYImages * IMAGE_SIZE}}
	rgba := image.NewRGBA(r)

	for i :=0; i < list.NumberOfImages ; i++ {
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







//for i := 0; i < len(imageInfoList); i++  {
//	fmt.Println(imageInfoList[i].Rect)
//}


//
//// Create a new file and write to it
//out, err := os.Create("./output.png")
//if err != nil {
//	panic(err)
//	os.Exit(1)
//}
//err = png.Encode(out, rgba)
//if err != nil {
//	panic(err)
//	os.Exit(1)
//}

//newRect := image.Rectangle{
//	Min: image.Point{0,0},
//	Max: image.Point{
//		X: numberOfImages * IMAGE_SIZE,
//		Y: numberOfImages * IMAGE_SIZE,
//	},
//}
//
//finImage := image.NewRGBA(newRect)
//// This is the cool part, all you have to do is loop through
//// each Pixel and set the image's color on the go
//for _, px := range pixelSum {
//	finImage.Set(
//		px.Point.X,
//		px.Point.Y,
//		px.Color,
//	)
//}
//draw.Draw(finImage, finImage.Bounds(), finImage, image.Point{0, 0}, draw.Src)
//
//// Create a new file and write to it
//out, err := os.Create("./output.png")
//if err != nil {
//	panic(err)
//	os.Exit(1)
//}

//img1, _, err := imageInfo.OpenAndDecode(sourceImagesPath + "1_1.png")
//if err != nil {
//	panic(err)
//}
//
//imgInfo1 := imageInfo.ImageInfo{
//	FileName : "0_1.png",
//	XLocation : 0,
//	YLocation : 0,
//	Img : img1,
//}
////imgInfo1.xLocation, imgInfo1.yLocation = imgInfo1.setXYLocation()
//imgInfo1.XLocation, imgInfo1.YLocation = imgInfo1.SetXYLocation()
//fmt.Println(imgInfo1.YLocation)

//img1, _, err := OpenAndDecode(sourceImagesPath + "1_1.png")
//if err != nil {
//	panic(err)
//}
//img2, _, err := OpenAndDecode(sourceImagesPath + "1_2.png")
//if err != nil {
//	panic(err)
//}
//
//
//// collect pixel data from each image
//// first image
//pixels1 := DecodePixelsFromImage(img1, 0, 0)
//
//// the second image has a Y-offset of img1's max Y (appended at bottom)
//pixels2 := DecodePixelsFromImage(img2, img1.Bounds().Max.X, 0)
//pixelSum := append(pixels1, pixels2...)
//
//// Set a new size for the new image equal to the max width
//// of bigger image and max height of two images combined
//newRect := image.Rectangle{
//	Min: img1.Bounds().Min,
//	Max: image.Point{
//		X: img2.Bounds().Max.X + img1.Bounds().Max.X,
//		Y: img2.Bounds().Max.Y,
//	},
//}
//finImage := image.NewRGBA(newRect)
//// This is the cool part, all you have to do is loop through
//// each Pixel and set the image's color on the go
//for _, px := range pixelSum {
//	finImage.Set(
//		px.Point.X,
//		px.Point.Y,
//		px.Color,
//	)
//}
//draw.Draw(finImage, finImage.Bounds(), finImage, image.Point{0, 0}, draw.Src)
//
//// Create a new file and write to it
//out, err := os.Create("./output.png")
//if err != nil {
//	panic(err)
//	os.Exit(1)
//}
//err = png.Encode(out, finImage)
//if err != nil {
//	panic(err)
//	os.Exit(1)
//}
//--------------working ------------
//pixels1 := DecodePixelsFromImage(imageInfoList[0].Img, 0, 0)
//
//// the second image has a Y-offset of img1's max Y (appended at bottom)
//pixels2 := DecodePixelsFromImage(imageInfoList[1].Img, IMAGE_SIZE, 0)
//pixelSum := append(pixels1, pixels2...)
//
//// Set a new size for the new image equal to the max width
//// of bigger image and max height of two images combined
//newRect := image.Rectangle{
//	Min: image.Point{0,0},
//	Max: image.Point{
//		X: IMAGE_SIZE * 2,
//		Y: IMAGE_SIZE,
//	},
//}
//finImage := image.NewRGBA(newRect)
//// This is the cool part, all you have to do is loop through
//// each Pixel and set the image's color on the go
//for _, px := range pixelSum {
//	finImage.Set(
//		px.Point.X,
//		px.Point.Y,
//		px.Color,
//	)
//}
//draw.Draw(finImage, finImage.Bounds(), finImage, image.Point{0, 0}, draw.Src)
//
//---------------------------------------