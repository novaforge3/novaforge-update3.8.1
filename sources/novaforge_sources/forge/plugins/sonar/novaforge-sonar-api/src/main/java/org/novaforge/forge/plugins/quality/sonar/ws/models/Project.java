package org.novaforge.forge.plugins.quality.sonar.ws.models;

public class Project {
	 
  private String id;
  private String k; /*key */
  private String nm ; /*name */
  private String sc ; /*scope */
  private String qu ; /* qualifier */
  
  public Project(String id, String k, String nm, String sc, String qu) {
    super();
    this.id = id;
    this.k = k;
    this.nm = nm;
    this.sc = sc;
    this.qu = qu;
  }

  /**
   * @return the id
   */
  public String getId()
  {
    return id;
  }

  /**
   * @param id 
   *		the id to set
   */
  public void setId(String id)
  {
    this.id = id;
  }

  /**
   * @return the k
   */
  public String getK()
  {
    return k;
  }

  /**
   * @param k 
   *		the k to set
   */
  public void setK(String k)
  {
    this.k = k;
  }

  /**
   * @return the nm
   */
  public String getNm()
  {
    return nm;
  }

  /**
   * @param nm 
   *		the nm to set
   */
  public void setNm(String nm)
  {
    this.nm = nm;
  }

  /**
   * @return the sc
   */
  public String getSc()
  {
    return sc;
  }

  /**
   * @param sc 
   *		the sc to set
   */
  public void setSc(String sc)
  {
    this.sc = sc;
  }

  /**
   * @return the qu
   */
  public String getQu()
  {
    return qu;
  }

  /**
   * @param qu 
   *		the qu to set
   */
  public void setQu(String qu)
  {
    this.qu = qu;
  }

}
