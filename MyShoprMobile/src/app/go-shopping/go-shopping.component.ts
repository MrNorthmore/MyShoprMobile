import { Component, OnInit } from "@angular/core";
import { RadSideDrawer } from "nativescript-ui-sidedrawer";
import * as app from "tns-core-modules/application";
import { EventData } from "tns-core-modules/data/observable";
import { Placeholder } from "tns-core-modules/ui/placeholder";
import { isAndroid } from "tns-core-modules/platform/platform";
import { ad } from "tns-core-modules/utils/utils";
import { ImageSource } from '@nativescript/core/image-source/image-source';

import { StoresService } from '../core/services/stores.service';
import { ShoppingService } from '../core/services/shopping.service';

@Component({
    selector: "GoShopping",
    moduleId: module.id,
    styleUrls: ["go-shopping.component.scss"],
    templateUrl: "./go-shopping.component.html",
})
export class GoShoppingComponent implements OnInit {
    slayout: any;
    imgSrc: ImageSource;
    aisles: Array<any>;
    items: Array<any> = [];

    constructor(private storeService: StoresService,
        private shopService: ShoppingService) {
    }

    ngOnInit(): void {
    }

    onDrawerButtonTap(): void {
        const sideDrawer = <RadSideDrawer>app.getRootView();
        sideDrawer.showDrawer();
    }

    pageLoaded(args: EventData): void {
        this.slayout = args.object;

        this.getData().then((store: any) => {
            this.aisles = store.aisles;
            this.getImagefromURL(store.layoutUrl).then((imgSrc) => {
                this.imgSrc = imgSrc;
                let placeholder = new Placeholder();
    
                if (isAndroid) placeholder.setNativeView(this.getLayoutViewAndroid());
    
                this.slayout.insertChild(placeholder, 0);
    
                this.aisles.forEach((aisle: any) => {
                    if (aisle.i) aisle.i.forEach((item: any) => {
                            item['aisle'] = aisle.aisleId;
                            this.items.push(item);
                        });
                    else this.items.push({ aisle: aisle.aisleId, name: "" });
                });
            });
        });
    }

    currScale: number = 1;
    onZoom(args: any): void {
        let scale = args.scale * this.currScale;
        this.slayout.animate({
            scale: { x: scale, y: scale },
            duration: 0
        });

        if (args.state === 3) this.currScale = scale;
    }

    currDeltaX: number = 0;
    currDeltaY: number = 0;
    onPan(args: any): void {
        let dx = args.deltaX + this.currDeltaX, dy = args.deltaY + this.currDeltaY;
        if (args.state === 3) {
            this.currDeltaX = dx;
            this.currDeltaY = dy;
        }
        this.slayout.animate({
            translate: { x: dx, y: dy},
            duration: 0
        });
    }

    getData(): Promise<any> {
        let aisles = [];
        let enterance: any, exit: any;
        let goShoppingItems = this.shopService.getGoShoppingItems();

        return new Promise((resolve) => {
            this.storeService.getStore(this.shopService.getSelectedStoreId()).subscribe((data: any) => {
                let store = data.data.storeById;
                let storeAisles = store.aisles;

                for (let i = 0; i < storeAisles.length; i++) {
                    if (storeAisles[i].aisleId == "entrance") enterance = storeAisles[i];
                    else if (storeAisles[i].aisleId == "checkout") exit = storeAisles[i];

                    let aItems = storeAisles[i].items;

                    for (let j = 0; j < goShoppingItems.length; j++) {

                        if (aItems.indexOf(goShoppingItems[j].sku) > -1) {
                            if (aisles.length === 0 || aisles[aisles.length-1].aisleId !== storeAisles[i].aisleId) {
                                aisles.push(storeAisles[i]);
                                aisles[aisles.length-1]['i'] = [goShoppingItems[j]];
                            } else aisles[aisles.length-1].i.push(goShoppingItems[j]);
                        }
                    }
                }
                
                if(enterance) aisles.unshift(enterance);
                if(exit) aisles.push(exit);
    
                store.aisles = aisles;
                resolve(store);
            });
        });
        // return new Promise((resolve) => {
        //     resolve([{
        //         id: "entrance",
        //         coords: [143, 720]
        //     },
        //     {
        //         item: "1",
        //         id: "1",
        //         coords: [67, 157]
        //     },
        //     {
        //         item: "2",
        //         id: "2",
        //         coords: [493, 100]
        //     },
        //     {
        //         item: "3",
        //         id: "3",
        //         coords: [440, 285]
        //     },
        //     {
        //         item: "4",
        //         id: "4",
        //         coords: [440, 480]
        //     },
        //     {
        //         item: "5",
        //         id: "5",
        //         coords: [843, 427]
        //     },
        //     {
        //         id: "checkout",
        //         coords: [1080, 750]
        //     }]);
        // });
    }

    getLayoutViewAndroid(): android.widget.ImageView {
        let nativeView = new android.widget.ImageView(ad.getApplicationContext());
        nativeView.setScaleType(android.widget.ImageView.ScaleType.FIT_CENTER);

        let bitmap: android.graphics.Bitmap = this.imgSrc.android.copy(android.graphics.Bitmap.Config.ARGB_8888, true);

        let canvas = new android.graphics.Canvas(bitmap);
        nativeView.setMaxHeight(bitmap.getHeight()
        );

        this.aisles.forEach(aisle => {
            this.addNodeToCanvasAndroid(aisle.position.xPos, aisle.position.yPos, 40, canvas);
        });

        this.drawPaths(canvas);
        nativeView.setImageBitmap(bitmap);
        return nativeView;
    }

    addNodeToCanvasAndroid(x: number, y: number, size: number, canvas: android.graphics.Canvas): void {
        let paint = new android.graphics.Paint();
        paint.setARGB(255, 0, 0, 255);
        paint.setAntiAlias(true);
        paint.setStrokeWidth(10);
        paint.setStyle(android.graphics.Paint.Style.STROKE)
        canvas.drawCircle(x, y, size, paint);
    }

    drawLine(pos1: any, pos2: any, canvas: android.graphics.Canvas): void {
        let paint = new android.graphics.Paint();
        paint.setARGB(255, 0, 0, 255);
        paint.setAntiAlias(true);
        paint.setStrokeWidth(10);
        paint.setStyle(android.graphics.Paint.Style.STROKE)
        canvas.drawLine(pos1.xPos, pos1.yPos, pos2.xPos, pos2.yPos, paint);
    }

    drawPaths(canvas: android.graphics.Canvas): void {
        this.sortAisles(0, this.aisles.length-1);

        for (let i = 0; i < this.aisles.length-1; i++)
            this.drawLine(this.aisles[i].position, this.aisles[i+1].position, canvas);
    }

    /**
     *  Assumew first and last elements of array aisles
     *  Heuristic search, time Complexity: O(n^2), space complexity: n
     *  n = itemAisleArr.length
     *  */
    sortAisles(startInd: number, endInd: number) {
        this.swapAisles(endInd, this.aisles.length-1);
        this.swapAisles(startInd, 0);
        this.sortAisleHelper(0);
    }

    /**
     *  Recursive
     *  Time Complexity (each loop): O(n)
     *  Each time indexsToBeTraversed.length decreases by 1.
     *  */
    sortAisleHelper(currIndex: number): void {
        let endIndex = this.aisles.length-1;

        if (currIndex >= endIndex) return;

        // O(n)
        let cAisleDisArr = this.getDisToAsile(currIndex, currIndex+1);
        let lAisleDisArr = this.getDisToAsile(endIndex, currIndex+1);

        let maxBias = null;
        let nextIndex = endIndex; // stores the index with maximum bias

        // O(n)
        for (let i = 0; i < cAisleDisArr.length; i++) {
            let bias = lAisleDisArr[i][0] // More bias the furthur away from last aisle
                - cAisleDisArr[i][0]; // More bias the closer to the curr aisle

            if (!maxBias || maxBias < bias) {
                maxBias = bias;
                nextIndex = cAisleDisArr[i][1];
            }
        }

        currIndex++;
        this.swapAisles(currIndex, nextIndex);
        this.sortAisleHelper(currIndex);
    }

    // Returns array of [distance, aisleIndex] sorted by distance for all aisleIndex in indexsToBeTraversed
    getDisToAsile(index: number, startIndex: number): Array<Array<number>> {
        let disArr = [];

        for (let i = startIndex; i < this.aisles.length-1; i++) {
            let dis = this.calculateDis(this.aisles[index].position, this.aisles[i].position);
            disArr.push([dis, i]);
        }

        return disArr;
    }

    swapAisles(ind1: number, ind2: number): void {
        let temp = this.aisles[ind1]
        this.aisles[ind1] = this.aisles[ind2]
        this.aisles[ind2] = temp
    }

    calculateDis(pos1: any, pos2: any): number {
        return Math.sqrt(Math.pow(pos1.xPos - pos2.xPos, 2) + Math.pow(pos1.yPos - pos2.yPos, 2));
    }

    getImagefromURL(url: string): Promise<ImageSource> {
        return ImageSource.fromUrl(url);
    }
}
