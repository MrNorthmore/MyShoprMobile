import { Component, OnInit } from "@angular/core";
import { StoresService } from "../services/stores.service";
import { RadSideDrawer } from "nativescript-ui-sidedrawer";
import * as app from "tns-core-modules/application";

@Component({
    selector: "StorePicker",
    moduleId: module.id,
    templateUrl: "./store-picker.component.html",
    providers: [StoresService]
})
export class StorePickerComponent implements OnInit {

    // Create an empty list to hold the available stores
    availableStoresList: any;

    constructor(private storeService: StoresService) {
    }

    ngOnInit(): void {
        this.storeService.getData().subscribe(stores => {
            this.availableStoresList = stores;
        });
    }

    onDrawerButtonTap(): void {
        const sideDrawer = <RadSideDrawer>app.getRootView();
        sideDrawer.showDrawer();
    }

    // onSelectItem(args) {
	// 	// for (let i = 0; i < this.dataList.items.length; i++) {
	// 	// 	if (this.dataList.items[i].selected) {
	// 	// 		this.dataList.items[i].selected = false;
	// 	// 		break;
	// 	// 	}
	// 	// }
	// 	// this.dataList.items[args.index].selected = true;
	// }

}
