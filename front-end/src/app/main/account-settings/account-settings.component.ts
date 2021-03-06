// Angular components
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';

// Application services
import { UserService } from '@services/user.service';
import { ProfileService } from '@services/profile.service';

// Toastr service and utilities
import { success, error, warning } from '@app/core/utils/toastr';
import { ToastrService } from 'ngx-toastr';

// Application models
import { Profile } from '@models/profile.model';
import { PartialList } from '@models/common/partial-list.model';
import { User } from '@models/user.model';

// Application constants
import { constants } from '@env/constants';
import { environment } from '@env/environment';
import { JwtHelperService } from '@services/security/jwt-helper.service';

// Translation imports
import { TranslationLoaderService } from '@app/core/services/translation-loader.service';
import { locale as en } from './i18n/en';
import { locale as fr } from './i18n/fr';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-account-settings',
  templateUrl: './account-settings.component.html',
  styleUrls: ['./account-settings.component.scss']
})
export class AccountSettingsComponent implements OnInit {

  /**
   * Loading data indicator
   */
  loadingProfiles: boolean;
  loading: boolean;
  saving: boolean;

  /**
   * The form group
   */
  form: FormGroup;
  
  /**
   * Profiles list
   */
  profiles: Array<Profile>;

  /**
   * The selected user object (account data)
   */
  selectedUser: User;
  
  /**
   * The selected picture preview
   */
  picturePreview: any;

  /**
   * Component constructor
   * 
   * @param userService The user service
   * @param profileService The profile service
   * @param _fb The form builder object
   * @param _toastr The toastr service
   * @param titleService The title service
   * @param jwtHelper The JWT helper service
   * @param _translationLoader The translation loader
   * @param translateService The translate service
   * 
   * @author EL OUFIR Hatim <eloufirhatim@gmail.com>
   */
  constructor(
    private userService: UserService,
    private profileService: ProfileService,
    private _fb: FormBuilder,
    private _toastr: ToastrService,
    titleService: Title,
    private jwtHelper: JwtHelperService,
    private _router: Router,
    private _translationLoader: TranslationLoaderService,
    private translateService: TranslateService
  ) {
    // Set the page title
    titleService.setTitle(constants.app_name + ' - Account settings');
    // Load translation
    this._translationLoader.loadTranslations(en, fr);
  }

  ngOnInit() {
    // Load account data
    this.loadData();
  }
  
  /**
   * Load account data
   * 
   * @author EL OUFIR Hatim <eloufirhatim@gmail.com>
   */
  loadData(): void {
    this.loading = true;
    this.userService.findById(+this.jwtHelper.id()).subscribe((res: User) => {
      if (!res) {
        return this._router.navigate([constants.home_url]);
      }
      this.selectedUser = res;
      this.initSaveForm();
      this.loading = false;
    });
  }

  /**
   * Initialize the save form group
   * 
   * @author EL OUFIR Hatim <eloufirhatim@gmail.com>
   */
  initSaveForm(): void {
    // Get the profiles list
    this.loadingProfiles = true;
    this.profileService.find()
      .subscribe((res: PartialList<Profile>) => {
        this.profiles = res.data;
        this.loadingProfiles = false;
      });
    if (!this.selectedUser.picture) {
      this.picturePreview = 'assets/images/faces/avatar.png';
    } else {
      this.picturePreview = environment.web_url + 'users/picture/' + this.selectedUser.id + '?v=' + Math.random();
    }
    // Initialize the form group object
    this.form = this._fb.group({
      email: [
        this.selectedUser ? this.selectedUser.email : '',
        [Validators.required, Validators.maxLength(255)]
      ],
      name: [
        this.selectedUser ? this.selectedUser.name : '',
        [Validators.required, Validators.maxLength(255)]
      ],
      password: [
        '',
        this.selectedUser && this.selectedUser.id ? [] : [Validators.required]
      ],
      password_confirmation: [
        '',
        this.selectedUser && this.selectedUser.id ? [] : [Validators.required]
      ]
    });
  }

  /**
   * Save the selected user
   * 
   * @author EL OUFIR Hatim <eloufirhatim@gmail.com>
   */
  save(): void {
    // Check if the form is valid
    if (this.form.valid) {
      this.saving = true;
      // Construct form data
      const formData = new FormData();
      if (this.selectedUser.picture instanceof File) {
        formData.append('picture', this.selectedUser.picture);
      }
      formData.append('id', this.selectedUser.id + '');
      formData.append('name', this.form.get('name').value);
      formData.append('email', this.form.get('email').value);
      formData.append('password', this.form.get('password').value);
      formData.append('password_confirmation', this.form.get('password_confirmation').value);
      formData.append('profiles', this.selectedUser.profiles.map((p: Profile) => p.id) + '');
      // Send save / update request to the service
      this.userService.save(formData, this.selectedUser.id ? true : false).subscribe((res: User) => {
        // Show success alert
        success('ACCOUNT_SETTINGS.TOASTS.TITLE.SUCCESS', 'ACCOUNT_SETTINGS.TOASTS.DESCRIPTION.SAVED', this._toastr, this.translateService);
        this.saving = false;
      }, (err: any) => {
        // Check if the error status is 403 (Form errors)
        if (err.status === 403) {
          // Show an error for each form validations errors list
          err.error.forEach((e: string) => {
            warning('ACCOUNT_SETTINGS.TOASTS.TITLE.WARNING', e, this._toastr, this.translateService);
          });
        } else {
          // Else, show an internal server error alert
          error('ACCOUNT_SETTINGS.TOASTS.TITLE.ERROR', 'ACCOUNT_SETTINGS.TOASTS.DESCRIPTION.ERROR', this._toastr, this.translateService);
        }
        this.saving = false;
      });
    }
  }

  /**
   * On select user's image changed event
   * 
   * @author EL OUFIR Hatim <eloufirhatim@gmail.com>
   */
  onImageChanged(file): void {
    this.selectedUser.picture = file;
    if (this.selectedUser && this.selectedUser.picture && this.selectedUser.picture instanceof File) {
      this.previewImage(this.selectedUser.picture);
    } else {
      this.picturePreview = 'assets/images/faces/avatar.png';
    }
  }

  /**
   * Build an image preview from the selected file
   * 
   * @param file The file selected by the user
   * 
   * @author EL OUFIR Hatim <eloufirhatim@gmail.com>
   */
  private previewImage(file: File): void {
    if (file.type.match(/image\/*/) == null) {
      this.picturePreview = 'assets/images/faces/avatar.png';
    } else {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (_event) => {
        this.picturePreview = reader.result;
      };
    }
  }

}
