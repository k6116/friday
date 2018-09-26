import { Injectable } from '@angular/core';
import { ApiDataAuthService } from '../../_shared/services/api-data/_index';
import { ToolsService } from '../../_shared/services/tools.service';
import { CacheService } from '../../_shared/services/cache.service';



export interface IBackgroundImage {
  thumbnail: IPath;
  fullSize: IPath;
  title: string;
  subTitle: string;
}

interface IPath {
  path: string;
}

interface IBackgroundImageFromIndex {
  fileName: string;
  caption: string;
  winnerDate: string;
}

@Injectable()
export class LoginImageService {

  constructor(
    private apiDataAuthService: ApiDataAuthService,
    private toolsService: ToolsService,
    private cacheService: CacheService
  ) { }


  // psedo-code for background image (blur up technique):
  // use two divs with background image urls laid on top of each other, one for the thumbnail (top) and one for the full-size
  // use two hidden img elements pointing to the same images to detect when they have completed loading using (load) event handler
  // when the thumbnail image has finished loading, display the login page and set the input focus
  // when the full-size image has finished loading, set the thumbnail div visibility to hidden, and..
  //   swap the class from small to large to trigger the transition/animation from 20px blur to 0px blur
  // then cache the image url, so on logout it will use that url and image load will be instant (no blur up)


  // get all the background images as metadata (file name, caption, and submission date) from the server: assets/login_images/_index.json
  async getBackgroundImages(): Promise<any> {

    return await this.apiDataAuthService.getLoginBackgroundImages().toPromise();

  }


  // choose a random background image from the list
  chooseBackgroundImage(images): IBackgroundImageFromIndex {

    // get a random number between zero and the number of background images
    const imageIndex = this.toolsService.randomBetween(0, images.length - 1);

    // return the background image object at that random index
    return images[imageIndex];

    // example object that could be returned:
    // {
    //   "fileName": "point_bonita.jpg",
    //   "caption": "View From Point Bonita Lighthouse near San Francisco, California",
    //   "winnerDate": "December, 2016"
    // }

  }


  // return an object that has all the data needed to display the image and caption in the view
  async getBackgroundImage(): Promise<IBackgroundImage> {

    // get all the background images as metadata (file name, caption, and submission date) from the server: assets/login_images/_index.json
    const backgroundImages = await this.getBackgroundImages();

    // choose a random background image from the list
    const selectedImage = this.chooseBackgroundImage(backgroundImages.images);

    // create an object to return that has the paths for both the thumbnail and full-size images
    // as well as info about the image to display in the lower right hand corner (title and sub-title)
    const selectedImageForView = {
      thumbnail: {
        path: `/assets/login_images/${selectedImage.fileName.replace('.jpg', '_thumbnail.jpg')}`
      },
      fullSize: {
        path: `/assets/login_images/${selectedImage.fileName}`
      },
      title: selectedImage.caption,
      subTitle: `Key Sightings, ${selectedImage.winnerDate}`
    };

    // store the image in the cache, for display upon logout
    this.saveImageInCache(selectedImageForView);

    // return the object
    return selectedImageForView;

  }

  saveImageInCache(selectedImageForView: IBackgroundImage) {

    // save the last shown image in the cache, to be used on logout so that the same image will be used and loaded immediately
    // should be in the browser cache as 304 not modified
    this.cacheService.backgroundImage = selectedImageForView;

  }



}








