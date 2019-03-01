// Angular components
import { Component, OnInit } from '@angular/core';
import { RoleService } from '@services/role.service';
import { PartialList } from '@models/common/partial-list.model';
import { Role } from '@models/role.model';

@Component({
  selector: 'app-roles',
  templateUrl: './roles.component.html',
  styleUrls: ['./roles.component.scss']
})
export class RolesComponent implements OnInit {

  /**
   * The roles partial list object
   */
  data: PartialList<Role>;

  /**
   * Loading data indicator
   */
  loading: boolean;

  /**
   * Current loaded page
   */
  page = 1;

  /**
   * Default page size
   */
  size = 10;

  /**
   * Component constructor
   * 
   * @param roleService The role service
   * 
   * @author EL OUFIR Hatim <eloufirhatim@gmail.com>
   */
  constructor(
    private roleService: RoleService
  ) { }

  /**
   * Component OnInit phase
   * 
   * @author EL OUFIR Hatim <eloufirhatim@gmail.com>
   */
  ngOnInit(): void {
    // Load roles list
    this.loadData();
  }

  /**
   * Load roles data
   * 
   * @author EL OUFIR Hatim <eloufirhatim@gmail.com>
   */
  loadData(page?: number): void {
    this.page = page ? page : 1;
    this.loading = true;
    this.roleService.find({
      page: this.page,
      size: this.size
    }).subscribe((res: PartialList<Role>) => {
      this.data = res;
      this.loading = false;
    });
  }

}
