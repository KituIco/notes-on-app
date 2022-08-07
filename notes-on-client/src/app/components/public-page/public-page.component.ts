import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';

import { Page } from 'src/app/interfaces/page';
import { Block, Sizes } from 'src/app/interfaces/block';
import { PageBlock } from 'src/app/interfaces/pageblock';
import { PageService } from 'src/app/services/page.service';
import { SocketService } from 'src/app/services/socket.service';
import { ToastrService } from 'ngx-toastr';

import Quill from 'quill';

const Link = Quill.import('formats/link');

class ClickableLink extends Link {
  public static create(value: string): ClickableLink {
    const node = super.create(value);
    node.setAttribute('href', Link.sanitize(value));
    node.setAttribute('target', '_blank');
    node.setAttribute('contenteditable', 'false');
    return node;
  }
}

Quill.register('formats/link', ClickableLink, true);
var Delta = Quill.import('delta');

@Component({
  selector: 'app-public-page',
  templateUrl: './public-page.component.html',
  styleUrls: ['./public-page.component.css']
})
export class PublicPageComponent implements OnInit {

  page!: Page;
  blocks: Block[] = []
  pageblocks: PageBlock[] = [];

  readOnly = true;
  notoastr = true;

  sizes: Sizes = {
    "full" : 12,
    "large": 8, 
    "half" : 6,
    "small": 4
  }

  form: FormGroup = this.formBuilder.group({
    cover: new FormControl(''),
    icon: new FormControl(''),
    title: new FormControl(''),
  })

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private pageService: PageService,
    private formBuilder: FormBuilder,
    private socketService: SocketService,
    private cdref: ChangeDetectorRef,
    private toastr: ToastrService,
  ) { }

  ngOnInit(): void {
    const pid = this.route.snapshot.paramMap.get('pageId');
    this.socketService.joinPage(pid!);
    this.getPublicPage();

    this.socketService.blockChanged.subscribe((payload) => {
      this.blocks[payload.order-1] = payload;
      this.form.get(payload.blockId)!.patchValue(payload.content);
      this.cdref.detectChanges();
    });

    this.socketService.pageChanged.subscribe((payload) => {
      this.page = payload;
      this.form.get('title')!.patchValue(payload.title);
      this.cdref.detectChanges();

      if (!this.page.shared && this.notoastr){
        this.notoastr = false;
        this.toastr.warning('Page Locked. Click here to visit NotesOn.', '', {disableTimeOut: true, positionClass: 'toast-bottom-right' })
        .onTap.pipe().subscribe(() => {
          this.router.navigate([""]);
        });
      }
    });

    this.socketService.blockAdded.subscribe((payload) => {
      this.blocks.splice(payload.order-1,0,payload);
      this.form = this.formBuilder.group({
        ...this.form.controls,
        [payload.blockId] : new FormControl(payload.content),
      });
      this.cdref.detectChanges();
    })

    this.socketService.orderChanged.subscribe((payload) => {
      this.blocks = payload;
      for(let i=0; i<this.blocks.length; i++) {
        let block = this.blocks[i];
        this.form = this.formBuilder.group({
          ...this.form.controls,
          [block.blockId] : new FormControl(block.content),
        });
      } 
      this.cdref.detectChanges();
    })
  }

  getPublicPage(): void {
    const pid = this.route.snapshot.paramMap.get('pageId')!;
    this.pageService.getPublicPage(pid)
      .subscribe(pageblocks => {
        this.pageblocks = pageblocks;
        this.page = pageblocks[0];
        if (this.page) this.form.get('title')!.patchValue(this.page.title);
        else this.router.navigate([""]);
        
        pageblocks.splice(0,1)
        this.blocks = pageblocks
        for(let i=0; i<this.blocks.length; i++) {
          let block = this.blocks[i];
          this.form = this.formBuilder.group({
            ...this.form.controls,
            [block.blockId] : new FormControl(block.content),
          });
        } 
      }); 
  }

}
