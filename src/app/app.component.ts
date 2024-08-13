import { Component, ElementRef, ViewChild, AfterViewInit, HostListener } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger); // Register ScrollTrigger with gsap

interface Frame {
  currentIndex: number;
  maxIndex: number;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit {
  title = 'gsap-scroll-animation-with-angular';

  @ViewChild('frame') canvas!: ElementRef<HTMLCanvasElement>;
  context!: CanvasRenderingContext2D | null;

  frames: Frame = {
    currentIndex: 0,
    maxIndex: 382,
  };

  images: HTMLImageElement[] = [];
  imagesLoaded = 0;

  ngAfterViewInit() {
    this.context = this.canvas.nativeElement.getContext('2d');
    this.preloadImages();
    this.handleResize(); // Ensure the canvas resizes correctly
  }

  preloadImages() {
    for (let i = 1; i <= this.frames.maxIndex; i++) {
      const imageUrl = `../assets/frames/frame_${i.toString().padStart(4, '0')}.jpeg`;
      const img = new Image();
      img.src = imageUrl;
      img.onload = () => {
        this.imagesLoaded++;
        if (this.imagesLoaded === this.frames.maxIndex) {
          this.loadImage(this.frames.currentIndex);
          this.startAnimation();
        }
      };
      this.images.push(img);
    }
  }

  loadImage(index: number) {
    if (index >= 0 && index <= this.frames.maxIndex && this.context) {
      const img = this.images[index];

      const canvasElement = this.canvas.nativeElement;
      const imgWidth = img.width;
      const imgHeight = img.height;

      // Calculate the scaling factors and offset positions
      const scale = Math.max(canvasElement.width / imgWidth, canvasElement.height / imgHeight);
      const newWidth = imgWidth * scale;
      const newHeight = imgHeight * scale;
      const offsetX = (canvasElement.width - newWidth) / 2;
      const offsetY = (canvasElement.height - newHeight) / 2;

      // Clear the canvas and draw the image
      this.context.clearRect(0, 0, canvasElement.width, canvasElement.height);
      this.context.imageSmoothingEnabled = true;
      this.context.imageSmoothingQuality = 'high';
      this.context.drawImage(img, offsetX, offsetY, newWidth, newHeight);

      this.frames.currentIndex = index;
    }
  }

  startAnimation() {
    gsap.timeline({
      scrollTrigger: {
        trigger: '.parent',
        start: 'top top',
        scrub: 2,
        markers: true,
      }
    }).to(this.frames, {
      currentIndex: this.frames.maxIndex,
      duration: 1,
      ease: 'none',
      onUpdate: () => {
        this.loadImage(Math.floor(this.frames.currentIndex));
      },
    });
  }

  @HostListener('window:resize', ['$event'])
  handleResize() {
    if (this.canvas) {
      this.canvas.nativeElement.width = window.innerWidth;
      this.canvas.nativeElement.height = window.innerHeight;
      this.loadImage(this.frames.currentIndex); // Reload the current image to fit the new size
    }
  }
}
