import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ClientService } from '../../services/client.service';
import { PolicyService } from '../../services/policy.service';
import { Client } from '../../models/client.model';
import { Policy } from '../../models/policy.model';

@Component({
  selector: 'app-client-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './client-detail.component.html',
  styleUrls: ['./client-detail.component.css']
})
export class ClientDetailComponent implements OnInit {
  clientGuid!: string;
  client?: Client;
  policies: Policy[] = [];
  loading: boolean = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private clientService: ClientService,
    private policyService: PolicyService
  ) {}

  ngOnInit(): void {
    this.clientGuid = this.route.snapshot.paramMap.get('guid') || '';
    if (this.clientGuid) {
      this.loadClientData();
    }
  }

  loadClientData(): void {
    this.loading = true;
    
    // Obtener datos del cliente
    this.clientService.getClientByGuid(this.clientGuid).subscribe({
      next: (data) => {
        this.client = data;
        this.loadPolicies();
      },
      error: (err) => console.error('Error cargando cliente:', err)
    });
  }

  loadPolicies(): void {
    // Obtener pólizas asociadas al cliente
    this.policyService.getPoliciesByClientGuid(this.clientGuid).subscribe({
      next: (policies) => {
        this.policies = policies;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error cargando pólizas:', err);
        this.loading = false;
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/clients']);
  }
}