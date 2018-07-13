package imageInfo

import (
	"fmt"
)

type ImageInfoList struct {
	List []ImageInfo
	NumberOfImages int
	NumberOfXImages int
	NumberOfYImages int
}

func (imgInfoList *ImageInfoList) InitList(fileNames []string, sourceImagesPath string) {
	imgInfoList.NumberOfImages = len(fileNames)
	imgInfoList.NumberOfXImages, imgInfoList.NumberOfYImages = 0 , 0
	imgInfoList.List = make([]ImageInfo, imgInfoList.NumberOfImages)

	for i, fileName := range fileNames {
		fmt.Println(fileName)
		imgInfoList.List[i].FileName = fileName

		x, y  := imgInfoList.List[i].SetXYLocation()
		imgInfoList.List[i].XLocation = x
		imgInfoList.List[i].YLocation = y
		imgInfoList.setMaxCoords(x, y)

		img, _, err := imgInfoList.List[i].OpenAndDecode(sourceImagesPath + imgInfoList.List[i].FileName)
		if err != nil {
			panic(err)
		}
		imgInfoList.List[i].Img = img
		imgInfoList.List[i].SP = imgInfoList.List[i].SetSP(1280)
		imgInfoList.List[i].Rect = imgInfoList.List[i].SetRect(imgInfoList.List[i].SP)

	}
}

func (imgInfoList *ImageInfoList) setMaxCoords(x, y int) {
	if (x > imgInfoList.NumberOfXImages) {
		imgInfoList.NumberOfXImages = x
	}
	if (y > imgInfoList.NumberOfYImages) {
		imgInfoList.NumberOfYImages = y
	}
}