import React from 'react';
import {
  DownloadSimple
} from '@phosphor-icons/react';

import { useNotification } from '@/context/NotificationContext';
import type { AuditLog } from '@/types/models';
import { formatRoleLabel } from '@/lib/utils';

interface AuditLogHeaderProps {
  logs: AuditLog[];
}

export const AuditLogHeader: React.FC<AuditLogHeaderProps> = ({ logs }) => {
  const notification = useNotification();

  const handleExportExcel = () => {
    if (!logs || logs.length === 0) {
      notification.warning('No audit logs available to export.');
      return;
    }

    let xml = `<?xml version="1.0"?>
<?excel-sheet-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
  <DocumentProperties xmlns="urn:schemas-microsoft-com:office:office">
    <Author>UCMS Security System</Author>
    <Created>${new Date().toISOString()}</Created>
  </DocumentProperties>
  <Styles>
    <Style ss:ID="Default" ss:Name="Normal">
      <Alignment ss:Vertical="Center"/>
      <Borders/>
      <Font ss:FontName="Segoe UI" x:Family="Swiss" ss:Size="10" ss:Color="#0F172A"/>
      <Interior/>
      <NumberFormat/>
      <Protection/>
    </Style>
    <Style ss:ID="TitleHeaderStyle">
      <Font ss:FontName="Segoe UI" ss:Size="12" ss:Bold="1" ss:Color="#1E67FC"/>
      <Interior ss:Color="#EBF2FF" ss:Pattern="Solid"/>
      <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="2" ss:Color="#CBD5E1"/>
      </Borders>
    </Style>
    <Style ss:ID="TableHeaderStyle">
      <Font ss:FontName="Segoe UI" ss:Size="10" ss:Bold="1" ss:Color="#FFFFFF"/>
      <Interior ss:Color="#0F172A" ss:Pattern="Solid"/>
      <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
    </Style>
    <Style ss:ID="DataStyle">
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
      </Borders>
    </Style>
    <Style ss:ID="ActionStyle">
      <Font ss:FontName="Segoe UI" ss:Size="10" ss:Bold="1" ss:Color="#1E67FC"/>
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
      </Borders>
    </Style>
    <Style ss:ID="CodeStyle">
      <Font ss:FontName="Courier New" ss:Size="9" ss:Color="#475569"/>
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
      </Borders>
    </Style>
  </Styles>

  <Worksheet ss:Name="Activity Logs">
    <Table ss:DefaultColumnWidth="150">
      <Column ss:Width="180"/> <!-- Administrator -->
      <Column ss:Width="140"/> <!-- Role -->
      <Column ss:Width="140"/> <!-- Operation -->
      <Column ss:Width="140"/> <!-- Subject Entity -->
      <Column ss:Width="120"/> <!-- Entity ID -->
      <Column ss:Width="250"/> <!-- Context Details -->
      <Column ss:Width="160"/> <!-- Execution Time -->
      <Row ss:Height="30">
        <Cell ss:MergeAcross="6" ss:StyleID="TitleHeaderStyle">
          <Data ss:Type="String">  SYSTEM ACTIVITY LOGS</Data>
        </Cell>
      </Row>
      <Row ss:Height="24" ss:StyleID="TableHeaderStyle">
        <Cell><Data ss:Type="String">ADMINISTRATOR</Data></Cell>
        <Cell><Data ss:Type="String">ROLE</Data></Cell>
        <Cell><Data ss:Type="String">OPERATION</Data></Cell>
        <Cell><Data ss:Type="String">SUBJECT ENTITY</Data></Cell>
        <Cell><Data ss:Type="String">ENTITY ID</Data></Cell>
        <Cell><Data ss:Type="String">CONTEXT DETAILS</Data></Cell>
        <Cell><Data ss:Type="String">EXECUTION TIME</Data></Cell>
      </Row>`;

    logs.forEach((log) => {
      const adminName = log.user?.name || 'Unknown Admin';
      const roleName = formatRoleLabel(log.user?.role) || 'N/A';
      const actionName = log.action?.replace(/_/g, ' ') || 'N/A';
      const entityName = log.entity || 'N/A';
      const entityId = log.entityId || 'N/A';
      let metadataStr = log.metadata || 'No context provided';
      try {
        const obj = JSON.parse(metadataStr);
        metadataStr = Object.entries(obj).map(([k, v]) => `${k}: ${v}`).join(', ');
      } catch {}

      const execTime = `${new Date(log.createdAt).toLocaleDateString()} ${new Date(log.createdAt).toLocaleTimeString()}`;

      xml += `      <Row ss:Height="20" ss:StyleID="DataStyle">
        <Cell><Data ss:Type="String">${adminName}</Data></Cell>
        <Cell><Data ss:Type="String">${roleName}</Data></Cell>
        <Cell ss:StyleID="ActionStyle"><Data ss:Type="String">${actionName}</Data></Cell>
        <Cell><Data ss:Type="String">${entityName}</Data></Cell>
        <Cell ss:StyleID="CodeStyle"><Data ss:Type="String">${entityId}</Data></Cell>
        <Cell><Data ss:Type="String">${metadataStr}</Data></Cell>
        <Cell><Data ss:Type="String">${execTime}</Data></Cell>
      </Row>\n`;
    });

    xml += `    </Table>
  </Worksheet>
</Workbook>`;

    const blob = new Blob([xml], { type: 'application/vnd.ms-excel' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `UCMS_Activity_Logs_${new Date().toISOString().split('T')[0]}.xls`;
    a.click();
    window.URL.revokeObjectURL(url);

    notification.success('Security Audit Trail Excel Spreadsheet downloaded successfully!');
  };

  return (
    <header className="premium-header !mb-0 !pb-6">
      <div className="header-content-root">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-main tracking-tight leading-none">Activity Logs</h1>
          <p className="text-xs uppercase font-black text-slate-500 tracking-widest mt-2.5">Activity Logs</p>
        </div>
        
        <div className="actions-cluster flex items-center gap-3">
          <button 
            className="btn-lux-primary h-12 !px-6"
            onClick={handleExportExcel}
          >
            <DownloadSimple size={18} weight="duotone" />
            <span>Export Excel</span>
          </button>
        </div>
      </div>
    </header>
  );
};
