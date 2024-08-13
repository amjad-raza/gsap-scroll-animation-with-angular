import { Component, ElementRef, ViewChild, AfterViewInit, HostListener } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

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
  private context!: CanvasRenderingContext2D | null;

  frames: Frame = {
    currentIndex: 0,
    maxIndex: 382,
  };

  private images: HTMLImageElement[] = [];
  imagesLoaded = 0;
  private resizeTimeout!: any;

  ngAfterViewInit() {
    this.context = this.canvas.nativeElement.getContext('2d');
    this.disableScroll(); // Disable scrolling initially
    this.preloadImages();
    this.handleResize();
  }

  disableScroll() {
    document.body.style.overflow = 'hidden';
  }

  enableScroll() {
    document.body.style.overflow = 'auto';
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
          this.enableScroll(); // Re-enable scrolling once all images are loaded
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

      const scale = Math.max(canvasElement.width / img.width, canvasElement.height / img.height);
      const newWidth = img.width * scale;
      const newHeight = img.height * scale;
      const offsetX = (canvasElement.width - newWidth) / 2;
      const offsetY = (canvasElement.height - newHeight) / 2;

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
        // markers: true,
      },
    }).to(this.frames, {
      currentIndex: this.frames.maxIndex,
      duration: 1,
      ease: 'none',
      onUpdate: () => {
        requestAnimationFrame(() => {
          this.loadImage(Math.floor(this.frames.currentIndex));
        });
      },
    });
  }

  @HostListener('window:resize')
  onResize() {
    clearTimeout(this.resizeTimeout);
    this.resizeTimeout = setTimeout(() => this.handleResize(), 200);
  }

  handleResize() {
    const canvasElement = this.canvas.nativeElement;
    canvasElement.width = window.innerWidth;
    canvasElement.height = window.innerHeight;
    this.loadImage(this.frames.currentIndex);
  }

  get loadingPercentage(): number {
    return Math.floor((this.imagesLoaded / this.frames.maxIndex) * 100);
  }
}
